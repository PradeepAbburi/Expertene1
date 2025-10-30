import { supabase } from '@/integrations/supabase/client';

const ONE_DAY = 24 * 60 * 60 * 1000;

export async function checkAndUpdateStreak(userId: string, currentPostTime = new Date(), username?: string) {
  const sb = supabase as any;

  try {
    console.debug('[streak] checkAndUpdateStreak start', { userId, currentPostTime: currentPostTime.toISOString() });
    // Ensure user profile exists (required for FK). Use maybeSingle to avoid throw when not found.
    const profileRes = await sb
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    console.debug('[streak] profileRes', profileRes);

    if (!profileRes.data) {
      const uname = username || `user_${userId.slice(0, 8)}`;
      const { error: profileErr } = await sb
        .from('profiles')
        .insert({ id: userId, user_id: userId, username: uname });
      if (profileErr) {
        console.error('Error inserting user profile:', profileErr);
        return null;
      }
    }

    // Load existing streak record, if any
    const { data: existingStreak, error: streakErr } = await sb
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.debug('[streak] existingStreak fetch', { existingStreak, streakErr });

    if (streakErr) {
      console.error('Error fetching streak record:', streakErr);
      return null;
    }

    const now = currentPostTime;

    if (!existingStreak) {
      // No streak record, create one starting at 1
      const { data, error } = await sb.from('user_streaks').insert([{ 
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: now.toISOString(),
        total_active_days: 1,
      }]).select('*').maybeSingle();
      console.debug('[streak] insert new streak result', { data, error });
      if (error) {
        console.error('Error inserting streak record:', error);
        return null;
      }
      return data.current_streak;
    }

    const lastPostTime = existingStreak.last_active_date ? new Date(existingStreak.last_active_date) : null;
    const diffMs = lastPostTime ? now.getTime() - lastPostTime.getTime() : null;
    const daysDiff = diffMs !== null ? Math.floor(diffMs / ONE_DAY) : null;

    // If no lastPostTime we treat as first post
    if (lastPostTime === null) {
      const { data, error } = await sb.from('user_streaks').update({
        current_streak: 1,
        longest_streak: Math.max(existingStreak.longest_streak || 0, 1),
        last_active_date: now.toISOString(),
        total_active_days: (existingStreak.total_active_days || 0) + 1,
      }).eq('user_id', userId).select('*').maybeSingle();
      console.debug('[streak] update when lastPostTime null', { data, error });
      if (error) {
        console.error('Error creating streak record:', error);
        return null;
      }
      return data.current_streak;
    }

    // Same day (daysDiff === 0): update last_active_date only
    if (daysDiff === 0) {
      const { data, error } = await sb.from('user_streaks').update({ last_active_date: now.toISOString() }).eq('user_id', userId).select('*').maybeSingle();
      console.debug('[streak] same-day update', { data, error });
      if (error) {
        console.error('Error updating last_active_date:', error);
        return null;
      }
      return data.current_streak;
    }

    // Posted yesterday -> increment streak
    if (daysDiff === 1) {
      const newStreak = (existingStreak.current_streak || 0) + 1;
      const { data, error } = await sb.from('user_streaks').update({
        current_streak: newStreak,
        longest_streak: Math.max(existingStreak.longest_streak || 0, newStreak),
        last_active_date: now.toISOString(),
        total_active_days: (existingStreak.total_active_days || 0) + 1,
      }).eq('user_id', userId).select('*').maybeSingle();
      console.debug('[streak] increment result', { newStreak, data, error });
      if (error) {
        console.error('Error incrementing streak:', error);
        return null;
      }
      return data.current_streak;
    }

    // Missed one or more days -> reset streak to 1
    if (daysDiff !== null && daysDiff > 1) {
      const { data, error } = await sb.from('user_streaks').update({
        current_streak: 1,
        last_active_date: now.toISOString(),
        total_active_days: (existingStreak.total_active_days || 0) + 1,
      }).eq('user_id', userId).select('*').maybeSingle();
      console.debug('[streak] reset result', { data, error });
      if (error) {
        console.error('Error resetting streak:', error);
        return null;
      }
      return data.current_streak;
    }

    // Fallback: return current value
    return existingStreak.current_streak || 0;
  } catch (err) {
    console.error('checkAndUpdateStreak error:', err);
    return null;
  }
}
