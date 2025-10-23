import { supabase } from '../lib/supabaseClient';
import { calculateStreak } from '../utils/streak';

export async function handleNewPost(userId: string, postContent: string) {
    const { data: user } = await supabase
        .from('users')
        .select('streak_count, last_posted_at')
        .eq('id', userId)
        .single();

    const newStreak = calculateStreak(user.last_posted_at, user.streak_count);

    await supabase
        .from('users')
        .update({ streak_count: newStreak, last_posted_at: new Date().toISOString() })
        .eq('id', userId);

    await supabase
        .from('posts')
        .insert([{ user_id: userId, content: postContent }]);

    return newStreak;
}