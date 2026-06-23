import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();
const replyAuthorColumns = ['user_id', 'author_id', 'commenter_id'] as const;
const missingNestedReplyColumnMessage =
  'Nested replies are not set up yet. Run report/supabase-social-features.sql in Supabase SQL Editor, then refresh the Supabase schema cache.';
const missingReplyAuthorColumnMessage =
  'Reply author column is missing. Run report/supabase-social-features.sql in Supabase SQL Editor, then refresh the Supabase schema cache.';

type ReplyAuthorColumn = (typeof replyAuthorColumns)[number];

type ReplyRow = {
  id: string;
  letter_id: string;
  user_id?: string | null;
  author_id?: string | null;
  commenter_id?: string | null;
  content: string;
  parent_comment_id?: string | null;
  created_at: string;
  updated_at?: string | null;
};

function normalizeReply(reply: ReplyRow) {
  return {
    ...reply,
    user_id: reply.user_id || reply.author_id || reply.commenter_id || '',
    parent_comment_id: reply.parent_comment_id ?? null,
  };
}

function missingColumn(error: { message?: string } | null | undefined, column: string) {
  const message = error?.message ?? '';
  return Boolean(
    message.includes(`'${column}' column`) ||
      message.includes(`column ${column}`) ||
      message.includes(`.${column}`),
  );
}

function replyColumns(authorColumn: ReplyAuthorColumn) {
  return `id, letter_id, ${authorColumn}, content, parent_comment_id, created_at, updated_at`;
}

async function fetchReplies(letterId: string) {
  for (const authorColumn of replyAuthorColumns) {
    const { data, error } = await supabase
      .from('letter_comments')
      .select(replyColumns(authorColumn))
      .eq('letter_id', letterId)
      .order('created_at', { ascending: true });

    if (!error) {
      return {
        replies: (data as unknown as ReplyRow[] | null) ?? [],
        error: null,
      };
    }

    if (missingColumn(error, 'parent_comment_id')) {
      return { replies: [], error: missingNestedReplyColumnMessage };
    }

    if (!missingColumn(error, authorColumn)) {
      return { replies: [], error: error.message };
    }
  }

  return { replies: [], error: missingReplyAuthorColumnMessage };
}

async function insertReply(letterId: string, userId: string, content: string, parentCommentId: string | null) {
  for (const authorColumn of replyAuthorColumns) {
    const { data, error } = await supabase
      .from('letter_comments')
      .insert({
        letter_id: letterId,
        [authorColumn]: userId,
        content,
        parent_comment_id: parentCommentId,
      })
      .select(replyColumns(authorColumn))
      .single();

    if (!error) {
      return { reply: data as unknown as ReplyRow, error: null };
    }

    if (missingColumn(error, 'parent_comment_id')) {
      return { reply: null, error: missingNestedReplyColumnMessage };
    }

    if (!missingColumn(error, authorColumn)) {
      return { reply: null, error: error.message };
    }
  }

  return { reply: null, error: missingReplyAuthorColumnMessage };
}

async function canAccessLetter(letterId: string, userId: string) {
  const { data: letter, error } = await supabase
    .from('letters')
    .select('id, sender_id, recipient_id, status, delivered_at, estimated_delivery_at')
    .eq('id', letterId)
    .maybeSingle();

  if (error || !letter) return false;
  if (letter.sender_id === userId) return true;
  if (letter.recipient_id !== userId) return false;
  if (letter.status === 'delivered' || letter.delivered_at) return true;
  return letter.estimated_delivery_at
    ? new Date(letter.estimated_delivery_at).getTime() <= Date.now()
    : false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!(await canAccessLetter(id, auth.user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { replies, error } = await fetchReplies(id);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const normalizedReplies = replies.map(normalizeReply);
    const userIds = Array.from(
      new Set(normalizedReplies.map((reply) => reply.user_id).filter(Boolean)),
    );
    const { data: users } =
      userIds.length > 0
        ? await supabase
            .from('users')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds)
        : { data: [] };

    return NextResponse.json({
      replies: normalizedReplies.map((reply) => ({
        ...reply,
        author: users?.find((user) => user.id === reply.user_id) ?? null,
      })),
    });
  } catch (error) {
    console.log('[api/letters/replies GET] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await getVerifiedAuthUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!(await canAccessLetter(id, auth.user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) {
      return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 });
    }

    const parentCommentId =
      typeof body.parentCommentId === 'string' && body.parentCommentId
        ? body.parentCommentId
        : null;

    if (parentCommentId) {
      const { data: parent, error: parentError } = await supabase
        .from('letter_comments')
        .select('id, letter_id')
        .eq('id', parentCommentId)
        .eq('letter_id', id)
        .maybeSingle();

      if (parentError) {
        return NextResponse.json({ error: parentError.message }, { status: 500 });
      }

      if (!parent) {
        return NextResponse.json({ error: 'Parent reply not found' }, { status: 404 });
      }
    }

    const { reply, error } = await insertReply(id, auth.user.id, content, parentCommentId);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const { data: letter } = await supabase
      .from('letters')
      .select('id, title, sender_id, recipient_id')
      .eq('id', id)
      .maybeSingle();

    const notificationUserId =
      letter?.sender_id === auth.user.id ? letter?.recipient_id : letter?.sender_id;

    if (notificationUserId) {
      const { data: actor } = await supabase
        .from('users')
        .select('username, full_name')
        .eq('id', auth.user.id)
        .maybeSingle();

      await supabase.from('notifications').insert({
        user_id: notificationUserId,
        type: 'letter_reply',
        title: 'New reply on your letter',
        message: `${actor?.username || actor?.full_name || 'Someone'} replied to "${
          letter?.title || 'your letter'
        }".`,
        related_user_id: auth.user.id,
        related_letter_id: id,
      });
    }

    return NextResponse.json(
      { reply: reply ? normalizeReply(reply) : reply },
      { status: 201 },
    );
  } catch (error) {
    console.log('[api/letters/replies POST] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
