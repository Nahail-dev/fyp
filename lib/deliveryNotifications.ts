import type { SupabaseClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email';

type DeliveredLetter = {
  id: string;
  recipient_id: string | null;
  sender_id: string | null;
  title: string | null;
  delivered_at?: string | null;
};

type UserSummary = {
  id: string;
  username: string | null;
  full_name: string | null;
};

const INTERNAL_EMAIL_MARKER = 'letter_delivery_email_sent';

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character]!,
  );
}

function getAppUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://fyp-yuubin.vercel.app';

  const url = configuredUrl.startsWith('http')
    ? configuredUrl
    : `https://${configuredUrl}`;

  return url.replace(/\/+$/, '');
}

function buildArrivalEmail(input: {
  recipientName: string;
  senderName: string;
  letterTitle: string;
  letterUrl: string;
}) {
  const recipientName = escapeHtml(input.recipientName);
  const senderName = escapeHtml(input.senderName);
  const letterTitle = escapeHtml(input.letterTitle);
  const letterUrl = escapeHtml(input.letterUrl);

  return {
    subject: `A letter from ${input.senderName} has arrived`,
    text: [
      `Hello ${input.recipientName},`,
      '',
      `A letter from ${input.senderName} has arrived in your Yuubin inbox.`,
      `Letter: ${input.letterTitle}`,
      '',
      `Open it here: ${input.letterUrl}`,
      '',
      'Take your time. Some words are worth waiting for.',
      'Yuubin',
    ].join('\n'),
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#fdf8f3;color:#3d2817;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fdf8f3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffbf7;border:1px solid #e8dcc8;">
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:1px solid #e8dcc8;text-align:center;">
                <div style="font-family:Georgia,serif;font-size:30px;font-weight:700;color:#b8944f;">Yuubin</div>
                <div style="margin-top:6px;font-size:13px;color:#6b5d52;">Mindful letters, delivered with time</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px;">
                <div style="font-size:14px;color:#6b5d52;">Hello ${recipientName},</div>
                <h1 style="margin:16px 0 12px;font-family:Georgia,serif;font-size:27px;line-height:1.25;color:#3d2817;">Your letter has arrived</h1>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#6b5d52;">
                  A thoughtful letter from <strong style="color:#3d2817;">${senderName}</strong> is now waiting in your inbox.
                </p>
                <div style="margin:24px 0;padding:18px;border-left:3px solid #d4af6a;background:#f5f1ed;">
                  <div style="font-size:12px;text-transform:uppercase;color:#8b6f47;">Letter</div>
                  <div style="margin-top:5px;font-family:Georgia,serif;font-size:20px;color:#3d2817;">${letterTitle}</div>
                </div>
                <a href="${letterUrl}" style="display:inline-block;background:#d4af6a;color:#3d2817;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:4px;">Open your letter</a>
                <p style="margin:26px 0 0;font-size:14px;line-height:1.6;color:#6b5d52;">
                  Take your time. Some words are worth waiting for.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid #e8dcc8;text-align:center;font-size:12px;color:#8b7a6b;">
                You received this email because arrival emails are enabled in your Yuubin settings.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

async function createDeliveredNotifications(
  supabase: SupabaseClient,
  letters: DeliveredLetter[],
) {
  if (!letters.length) return 0;

  const letterIds = letters.map((letter) => letter.id);
  const { data: existing, error: existingError } = await supabase
    .from('notifications')
    .select('related_letter_id')
    .eq('type', 'letter_delivered')
    .in('related_letter_id', letterIds);

  if (existingError) throw existingError;

  const existingIds = new Set(
    existing?.map((notification) => notification.related_letter_id) ?? [],
  );
  const rows = letters
    .filter((letter) => letter.recipient_id && !existingIds.has(letter.id))
    .map((letter) => ({
      user_id: letter.recipient_id,
      type: 'letter_delivered',
      title: 'Your letter has arrived',
      message: `"${letter.title || 'Untitled letter'}" is now ready to open.`,
      related_user_id: letter.sender_id,
      related_letter_id: letter.id,
    }));

  if (!rows.length) return 0;

  const { error } = await supabase.from('notifications').insert(rows);
  if (error) throw error;
  return rows.length;
}

async function sendPendingArrivalEmails(
  supabase: SupabaseClient,
  letters: DeliveredLetter[],
) {
  const candidates = letters.filter(
    (letter) => letter.recipient_id && letter.sender_id,
  );
  if (!candidates.length) {
    return { sent: 0, skipped: 0, failed: 0 };
  }
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return { sent: 0, skipped: candidates.length, failed: 0 };
  }

  const letterIds = candidates.map((letter) => letter.id);
  const { data: sentMarkers, error: markerError } = await supabase
    .from('notifications')
    .select('related_letter_id')
    .eq('type', INTERNAL_EMAIL_MARKER)
    .in('related_letter_id', letterIds);

  if (markerError) throw markerError;

  const alreadySent = new Set(
    sentMarkers?.map((marker) => marker.related_letter_id) ?? [],
  );
  const pending = candidates.filter((letter) => !alreadySent.has(letter.id));
  if (!pending.length) {
    return { sent: 0, skipped: 0, failed: 0 };
  }

  const userIds = Array.from(
    new Set(
      pending.flatMap((letter) => [
        letter.recipient_id as string,
        letter.sender_id as string,
      ]),
    ),
  );
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, full_name')
    .in('id', userIds);

  if (usersError) throw usersError;

  const usersById = new Map(
    ((users ?? []) as UserSummary[]).map((user) => [user.id, user]),
  );
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const letter of pending) {
    const recipientId = letter.recipient_id as string;
    const senderId = letter.sender_id as string;
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(recipientId);

    if (authError || !authUser.user?.email) {
      failed += 1;
      console.error('[delivery-email] recipient lookup failed', {
        letterId: letter.id,
        message: authError?.message || 'Recipient email is missing',
      });
      continue;
    }

    if (authUser.user.user_metadata?.email_on_delivery === false) {
      const { error: optOutMarkerError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: INTERNAL_EMAIL_MARKER,
          title: 'Arrival email skipped',
          message: 'disabled-by-user',
          related_user_id: senderId,
          related_letter_id: letter.id,
          is_read: true,
        });
      if (optOutMarkerError) {
        console.error('[delivery-email] opt-out marker insert failed', {
          letterId: letter.id,
          message: optOutMarkerError.message,
        });
      }
      skipped += 1;
      continue;
    }

    const recipient = usersById.get(recipientId);
    const sender = usersById.get(senderId);
    const recipientName =
      recipient?.full_name || recipient?.username || 'Yuubin friend';
    const senderName = sender?.username || sender?.full_name || 'A Yuubin friend';
    const letterTitle = letter.title || 'Untitled letter';
    const letterUrl = `${getAppUrl()}/app/letter/${encodeURIComponent(letter.id)}`;
    const email = buildArrivalEmail({
      recipientName,
      senderName,
      letterTitle,
      letterUrl,
    });
    const result = await sendTransactionalEmail({
      to: authUser.user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey: `letter-delivered-${letter.id}`,
    });

    if (!result.sent) {
      if (result.skipped) {
        skipped += 1;
      } else {
        failed += 1;
        console.error('[delivery-email] send failed', {
          letterId: letter.id,
          message: result.error,
        });
      }
      continue;
    }

    const { error: markerInsertError } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        type: INTERNAL_EMAIL_MARKER,
        title: 'Arrival email sent',
        message: result.id,
        related_user_id: senderId,
        related_letter_id: letter.id,
        is_read: true,
      });

    if (markerInsertError) {
      console.error('[delivery-email] marker insert failed', {
        letterId: letter.id,
        message: markerInsertError.message,
      });
    }
    sent += 1;
  }

  return { sent, skipped, failed };
}

export async function syncLetterDeliveries(
  supabase: SupabaseClient,
  userId?: string | null,
) {
  const now = new Date().toISOString();
  let updateQuery = supabase
    .from('letters')
    .update({
      delivered_at: now,
      status: 'delivered',
      updated_at: now,
    })
    .is('delivered_at', null)
    .not('estimated_delivery_at', 'is', null)
    .lte('estimated_delivery_at', now)
    .neq('status', 'draft');

  if (userId) {
    updateQuery = updateQuery.or(
      `sender_id.eq.${userId},recipient_id.eq.${userId}`,
    );
  }

  const { data: newlyDelivered, error: updateError } = await updateQuery.select(
    'id, recipient_id, sender_id, title, delivered_at',
  );
  if (updateError) throw updateError;

  const retryWindow = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  let pendingQuery = supabase
    .from('letters')
    .select('id, recipient_id, sender_id, title, delivered_at')
    .not('delivered_at', 'is', null)
    .gte('delivered_at', retryWindow)
    .neq('status', 'draft')
    .order('delivered_at', { ascending: false })
    .limit(200);

  if (userId) {
    pendingQuery = pendingQuery.or(
      `sender_id.eq.${userId},recipient_id.eq.${userId}`,
    );
  }

  const { data: recentDelivered, error: pendingError } = await pendingQuery;
  if (pendingError) throw pendingError;

  const deliveredLetters = (recentDelivered ?? []) as DeliveredLetter[];
  const notificationsCreated = await createDeliveredNotifications(
    supabase,
    deliveredLetters,
  );
  const email = await sendPendingArrivalEmails(supabase, deliveredLetters);

  return {
    delivered: newlyDelivered?.length ?? 0,
    notificationsCreated,
    emailsSent: email.sent,
    emailsSkipped: email.skipped,
    emailsFailed: email.failed,
  };
}
