type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

type SendEmailResult =
  | { sent: true; id: string }
  | { sent: false; skipped: boolean; error: string };

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      sent: false,
      skipped: true,
      error: 'Email provider is not configured',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        tags: [{ name: 'category', value: 'letter-delivered' }],
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!response.ok || !payload?.id) {
      return {
        sent: false,
        skipped: false,
        error:
          payload?.message ||
          payload?.name ||
          `Email provider returned ${response.status}`,
      };
    }

    return { sent: true, id: payload.id };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : 'Email request failed',
    };
  }
}
