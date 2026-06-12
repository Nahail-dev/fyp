import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getVerifiedAuthUser } from '@/lib/apiAuth';

const supabase = getServiceSupabase();
const allowedReactions = new Set(['heart', 'smile', 'wow', 'sad']);

type ReactionRow = {
  id: string;
  letter_id: string;
  user_id: string;
  reaction_type: string | null;
  created_at: string;
};

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

    const { data: reactions, error } = await supabase
      .from('letter_reactions')
      .select('id, letter_id, user_id, reaction_type, created_at')
      .eq('letter_id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts = { heart: 0, smile: 0, wow: 0, sad: 0 };
    const mine: string[] = [];
    for (const reaction of (reactions ?? []) as ReactionRow[]) {
      const value = reaction.reaction_type || '';
      if (value in counts) {
        counts[value as keyof typeof counts] += 1;
      }
      if (reaction.user_id === auth.user.id) {
        mine.push(value);
      }
    }

    return NextResponse.json({ counts, mine });
  } catch (error) {
    console.log('[api/letters/reactions GET] failed:', error);
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
    const reaction = typeof body.reaction === 'string' ? body.reaction : '';
    if (!allowedReactions.has(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('letter_reactions')
      .select('id')
      .eq('letter_id', id)
      .eq('user_id', auth.user.id)
      .eq('reaction_type', reaction)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      const { error } = await supabase
        .from('letter_reactions')
        .delete()
        .eq('id', existing.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ toggled: false });
    }

    const { error } = await supabase.from('letter_reactions').insert({
        letter_id: id,
        user_id: auth.user.id,
        reaction_type: reaction,
      });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ toggled: true }, { status: 201 });
  } catch (error) {
    console.log('[api/letters/reactions POST] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
