import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DayEntry {
  date: string; // ISO
  posts: Array<{ id: string; title: string; published_at: string }>;
}

export function StreakHistory({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [longestStreak, setLongestStreak] = useState<number | null>(null);
  const [days, setDays] = useState<DayEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        // fetch user_streaks record
        const { data: streakData } = await (supabase as any)
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', user.id)
          .single();

        setCurrentStreak(streakData?.current_streak ?? 0);
        setLongestStreak(streakData?.longest_streak ?? 0);

        // fetch user's articles for the last 30 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 29); // include today -> 30 days

        const { data: posts } = await (supabase as any)
          .from('articles')
          .select('id, title, published_at')
          .eq('author_id', user.id)
          .gte('published_at', fromDate.toISOString())
          .order('published_at', { ascending: false });

        const dayMap: Record<string, DayEntry> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          dayMap[key] = { date: key, posts: [] };
        }

        (posts || []).forEach((p: any) => {
          if (!p.published_at) return;
          const key = new Date(p.published_at).toISOString().slice(0, 10);
          if (!dayMap[key]) return;
          dayMap[key].posts.push({ id: p.id, title: p.title, published_at: p.published_at });
        });

        setDays(Object.values(dayMap).sort((a, b) => (a.date < b.date ? 1 : -1)));
      } catch (err) {
        console.error('Failed to load streak history', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Streak & Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={(user as any)?.avatar_url} />
              <AvatarFallback>{(user as any)?.email?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm text-muted-foreground">Current streak</div>
              <div className="text-2xl font-bold">{currentStreak ?? '—'}</div>
              <div className="text-sm text-muted-foreground">Longest: {longestStreak ?? '—'}</div>
            </div>
            <div className="ml-auto">
              <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Last 30 days</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                {days.map((d) => (
                  <div key={d.date} className="flex items-start gap-3 p-2 rounded border">
                    <div className="w-28 text-sm">{new Date(d.date).toLocaleDateString()}</div>
                    <div className="flex-1">
                      {d.posts.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No posts</div>
                      ) : (
                        <ul className="list-disc ml-4 text-sm">
                          {d.posts.map((p) => (
                            <li key={p.id}><a className="hover:underline" href={`/page/${p.id}`}>{p.title || '(untitled)'}</a></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StreakHistory;
