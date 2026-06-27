import type { SupabaseClient } from '@supabase/supabase-js';

export type StampAchievement = {
  key: string;
  stampId: string;
  quantity: number;
  title: string;
  description: string;
};

const ACHIEVEMENTS: StampAchievement[] = [
  {
    key: 'sent_5_letters',
    stampId: 'yuubin-rare',
    quantity: 3,
    title: 'Golden Route unlocked',
    description: 'Send 5 letters to unlock 3 rare stamps.',
  },
  {
    key: 'first_international_letter',
    stampId: 'yuubin-epic',
    quantity: 2,
    title: 'Long Distance unlocked',
    description: 'Send a letter outside your country to unlock 2 epic stamps.',
  },
  {
    key: 'yuubin_legend_25_sent_3_international',
    stampId: 'yuubin-legendary',
    quantity: 1,
    title: 'Yuubin Legend unlocked',
    description:
      'Send 25 letters including 3 international letters to unlock a legendary stamp.',
  },
];

function isMissingAchievementTable(error: { code?: string; message?: string } | null) {
  return (
    error?.code === '42P01' ||
    error?.message?.includes('user_stamp_achievements') ||
    error?.message?.includes('schema cache')
  );
}

async function addStampQuantity(
  supabase: SupabaseClient,
  userId: string,
  stampId: string,
  quantity: number,
) {
  const { data: current, error: currentError } = await supabase
    .from('user_stamp_inventory')
    .select('quantity')
    .eq('user_id', userId)
    .eq('stamp_id', stampId)
    .maybeSingle();

  if (currentError) throw currentError;

  const nextQuantity = Number(current?.quantity ?? 0) + quantity;
  const { error: upsertError } = await supabase.from('user_stamp_inventory').upsert(
    {
      user_id: userId,
      stamp_id: stampId,
      quantity: nextQuantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,stamp_id' },
  );

  if (upsertError) throw upsertError;
}

export async function syncStampAchievements(
  supabase: SupabaseClient,
  userId: string,
) {
  const [sentResult, internationalResult, achievementsResult] = await Promise.all([
    supabase
      .from('letters')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId)
      .neq('status', 'draft'),
    supabase
      .from('letters')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId)
      .neq('status', 'draft')
      .in('delivery_rule', ['same_continent', 'outside_continent']),
    supabase
      .from('user_stamp_achievements')
      .select('achievement_key')
      .eq('user_id', userId),
  ]);

  if (isMissingAchievementTable(achievementsResult.error)) {
    console.log(
      '[stamp-achievements] table missing. Run report/supabase-stamp-achievements.sql',
    );
    return [];
  }

  if (sentResult.error) throw sentResult.error;
  if (internationalResult.error) throw internationalResult.error;
  if (achievementsResult.error) throw achievementsResult.error;

  const sentCount = sentResult.count ?? 0;
  const internationalCount = internationalResult.count ?? 0;
  const unlockedKeys = new Set(
    achievementsResult.data?.map((row) => String(row.achievement_key)) ?? [],
  );

  const qualified = ACHIEVEMENTS.filter((achievement) => {
    if (unlockedKeys.has(achievement.key)) return false;
    if (achievement.key === 'sent_5_letters') return sentCount >= 5;
    if (achievement.key === 'first_international_letter') return internationalCount >= 1;
    if (achievement.key === 'yuubin_legend_25_sent_3_international') {
      return sentCount >= 25 && internationalCount >= 3;
    }
    return false;
  });

  const granted: StampAchievement[] = [];

  for (const achievement of qualified) {
    const { error: achievementError } = await supabase
      .from('user_stamp_achievements')
      .insert({
        user_id: userId,
        achievement_key: achievement.key,
        stamp_id: achievement.stampId,
        quantity: achievement.quantity,
      });

    if (achievementError?.code === '23505') {
      continue;
    }

    if (achievementError) {
      throw achievementError;
    }

    await addStampQuantity(supabase, userId, achievement.stampId, achievement.quantity);
    granted.push(achievement);
  }

  return granted;
}