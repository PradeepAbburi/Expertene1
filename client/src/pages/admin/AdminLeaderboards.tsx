import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trophy, Users, Flame, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StreakEntry {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_active_days: number;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface FollowerEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export default function AdminLeaderboards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streakLeaderboard, setStreakLeaderboard] = useState<StreakEntry[]>([]);
  const [followerLeaderboard, setFollowerLeaderboard] = useState<FollowerEntry[]>([]);
  const [loadingStreaks, setLoadingStreaks] = useState(true);
  const [loadingFollowers, setLoadingFollowers] = useState(true);

  useEffect(() => {
    fetchStreakLeaderboard();
    fetchFollowerLeaderboard();
  }, []);

  const fetchStreakLeaderboard = async () => {
    setLoadingStreaks(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_streaks')
        .select(`
          user_id,
          current_streak,
          longest_streak,
          total_active_days,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('current_streak', { ascending: false })
        .order('longest_streak', { ascending: false })
        .limit(100);

      if (error) throw error;
      setStreakLeaderboard(data || []);
    } catch (error: any) {
      console.error('Error fetching streak leaderboard:', error);
      toast({
        title: 'Failed to fetch streaks',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingStreaks(false);
    }
  };

  const fetchFollowerLeaderboard = async () => {
    setLoadingFollowers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, followers_count, following_count, created_at')
        .order('followers_count', { ascending: false })
        .limit(100);

      if (error) throw error;
      setFollowerLeaderboard(data || []);
    } catch (error: any) {
      console.error('Error fetching follower leaderboard:', error);
      toast({
        title: 'Failed to fetch followers',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingFollowers(false);
    }
  };

  const exportStreaksToCSV = () => {
    const headers = ['Rank', 'Username', 'Display Name', 'Current Streak', 'Longest Streak', 'Total Active Days'];
    const rows = streakLeaderboard.map((entry, index) => [
      index + 1,
      entry.profiles.username,
      entry.profiles.display_name || '',
      entry.current_streak,
      entry.longest_streak,
      entry.total_active_days,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streak-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Streak leaderboard downloaded as CSV',
    });
  };

  const exportFollowersToCSV = () => {
    const headers = ['Rank', 'Username', 'Display Name', 'Followers', 'Following', 'Join Date'];
    const rows = followerLeaderboard.map((entry, index) => [
      index + 1,
      entry.username,
      entry.display_name || '',
      entry.followers_count,
      entry.following_count,
      new Date(entry.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follower-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Follower leaderboard downloaded as CSV',
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">Leaderboards</h1>
          <p className="text-muted-foreground mt-1">View and export platform leaderboard data</p>
        </div>
      </div>

      <Tabs defaultValue="streaks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="streaks" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Followers
          </TabsTrigger>
        </TabsList>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Streaks</CardTitle>
                  <CardDescription>Top 100 users by current streak</CardDescription>
                </div>
                <Button onClick={exportStreaksToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loadingStreaks ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : streakLeaderboard.length > 0 ? (
                  streakLeaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                          {getRankBadge(index + 1)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.profiles.avatar_url} />
                          <AvatarFallback>
                            {entry.profiles.display_name?.charAt(0) || entry.profiles.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {entry.profiles.display_name || entry.profiles.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{entry.profiles.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Badge variant="secondary" className="gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {entry.current_streak}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Current</p>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="gap-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            {entry.longest_streak}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Best</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{entry.total_active_days}</p>
                          <p className="text-xs text-muted-foreground">Active Days</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No streak data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Followed Users</CardTitle>
                  <CardDescription>Top 100 users by follower count</CardDescription>
                </div>
                <Button onClick={exportFollowersToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loadingFollowers ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : followerLeaderboard.length > 0 ? (
                  followerLeaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                          {getRankBadge(index + 1)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar_url} />
                          <AvatarFallback>
                            {entry.display_name?.charAt(0) || entry.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {entry.display_name || entry.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{entry.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {entry.followers_count}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{entry.following_count}</p>
                          <p className="text-xs text-muted-foreground">Following</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Joined</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No user data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
