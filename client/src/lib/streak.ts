import { supabase } from '@/integrations/supabase/client';

const ONE_DAY = 24 * 60 * 60 * 1000;

function isSameDay(d1: Date, d2: Date) {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();
}

export async function checkAndUpdateStreak(userId: string, currentPostTime = new Date(), username?: string) {
  const sb = supabase as any;

  try {
    // Ensure user profile exists (required for FK)
    let profileRes = await sb
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profileRes.data) {
      // Insert minimal profile if missing
      const uname = username || `user_${userId.slice(0, 8)}`;
      const { error: profileErr } = await sb
        .from('profiles')
        .insert({ id: userId, user_id: userId, username: uname })
        .select('id')
        .single();
      if (profileErr) {
        console.error('Error inserting user profile:', profileErr);
        return null;
      }
    }
    const { data: existingStreak, error: selectErr } = await sb
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (selectErr && selectErr.code !== 'PGRST116') {
      // unexpected error
      console.error('Error fetching streak record:', selectErr);
      return null;
    }

    const now = currentPostTime;

    let streakRecord = existingStreak;
    if (!streakRecord) {
      // No streak record, create one
      const { data, error } = await sb.from('user_streaks').insert([{ 
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: now.toISOString(),
        total_active_days: 1,
      }]).select('*').single();
      if (error) {
        console.error('Error inserting streak record:', error);
        return null;
      }
      return data.current_streak;
    }

    const lastPostTime = streakRecord.last_active_date ? new Date(streakRecord.last_active_date) : null;
    const diff = lastPostTime ? now.getTime() - lastPostTime.getTime() : null;

    if (!lastPostTime || (diff && diff >= ONE_DAY && !isSameDay(now, lastPostTime))) {
      // First post or new day: increment streak
      let newStreak = (streakRecord.current_streak || 0) + 1;
      const { data, error } = await sb.from('user_streaks').update({
        current_streak: newStreak,
        longest_streak: Math.max(streakRecord.longest_streak || 0, newStreak),
        last_active_date: now.toISOString(),
        total_active_days: (streakRecord.total_active_days || 0) + 1,
      }).eq('user_id', userId).select('*').single();
      if (error) {
        console.error('Error incrementing streak:', error);
        return null;
      }
      return data.current_streak;
    } else if (diff && diff < ONE_DAY && isSameDay(now, lastPostTime)) {
      // Already posted today, do not increment
      const { data, error } = await sb.from('user_streaks').update({
        last_active_date: now.toISOString(),
      }).eq('user_id', userId).select('*').single();
      if (error) {
        console.error('Error updating last_active_date:', error);
        return null;
      }
      return data.current_streak;
    } else if (diff && diff >= 2 * ONE_DAY) {
      // Streak broken, reset to 1
      const { data, error } = await sb.from('user_streaks').update({
        current_streak: 1,
        last_active_date: now.toISOString(),
        total_active_days: (streakRecord.total_active_days || 0) + 1,
      }).eq('user_id', userId).select('*').single();
      if (error) {
        console.error('Error resetting streak:', error);
        return null;
      }
      return data.current_streak;
    }
  } catch (err) {
    console.error('checkAndUpdateStreak error:', err);
    return null;
  }
}
