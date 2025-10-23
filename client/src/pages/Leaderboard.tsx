import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Flame, Medal, Award, Users } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface LeaderboardEntry {
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

interface FollowerLeaderboardEntry {
  user_id: string;
  followers_count: number;
  following_count: number;
  username: string;
  display_name: string;
  avatar_url: string;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState<'all' | 'country' | 'region'>('all');
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [followerLeaderboard, setFollowerLeaderboard] = useState<FollowerLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userStreak, setUserStreak] = useState<LeaderboardEntry | null>(null);
  const [userFollowerRank, setUserFollowerRank] = useState<number | null>(null);
  const [userFollowerData, setUserFollowerData] = useState<FollowerLeaderboardEntry | null>(null);

  useEffect(() => {
    // Attempt to derive user's country/region from profile.location if available
    // Expected format: "City, Country" or "Region, Country"; we will parse the last part as country.
    const fetchUserLocation = async () => {
      try {
        if (!user?.id) {
          setUserCountry(null);
          setUserRegion(null);
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('location')
          .eq('user_id', user.id)
          .single();
        if (!error && data?.location) {
          const loc = String(data.location);
          const parts = loc.split(',').map((p) => p.trim()).filter(Boolean);
          if (parts.length > 0) {
            const country = parts[parts.length - 1];
            setUserCountry(country);
            // Heuristic for region: if at least 2 parts, second to last as region/state
            setUserRegion(parts.length > 1 ? parts[parts.length - 2] : null);
          } else {
            setUserCountry(null);
            setUserRegion(null);
          }
        } else {
          setUserCountry(null);
          setUserRegion(null);
        }
      } catch {
        setUserCountry(null);
        setUserRegion(null);
      }
    };

    fetchUserLocation();
  }, [user?.id]);

  useEffect(() => {
    fetchLeaderboard();
    fetchFollowerLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, scope, userCountry, userRegion]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const sb = supabase as any;
      let query = sb
        .from('user_streaks')
        .select(`
          user_id,
          current_streak,
          longest_streak,
          total_active_days,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            location
          )
        `)
        .order('current_streak', { ascending: false })
        .order('longest_streak', { ascending: false })
        .limit(500);

      // Apply filters by scope using profiles.location
      if (scope === 'country' && userCountry) {
        // match end of string or contains country token
        query = query.filter('profiles.location', 'ilike', `%${userCountry}`);
      } else if (scope === 'region' && userRegion) {
        query = query.filter('profiles.location', 'ilike', `%${userRegion}%`);
      }
      const { data, error } = await query;
      if (error) throw error;

      let rows = (data as LeaderboardEntry[]) || [];
      // Client-side filter as a fallback to ensure correct scoping
      if (scope === 'country' && userCountry) {
        rows = rows.filter((e) => {
          const loc = (e as any)?.profiles?.location as string | undefined;
          return loc ? loc.toLowerCase().includes(userCountry.toLowerCase()) : false;
        });
      } else if (scope === 'region' && userRegion) {
        rows = rows.filter((e) => {
          const loc = (e as any)?.profiles?.location as string | undefined;
          return loc ? loc.toLowerCase().includes(userRegion.toLowerCase()) : false;
        });
      }
      setLeaderboard(rows);

      if (user) {
        const userIndex = rows.findIndex((entry) => entry.user_id === user.id);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
          setUserStreak(rows[userIndex]);
        } else {
          setUserRank(null);
          setUserStreak(null);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowerLeaderboard = async () => {
    setFollowersLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('user_id, followers_count, following_count, username, display_name, avatar_url, location')
        .order('followers_count', { ascending: false })
        .limit(500);

      // Apply filters by scope
      if (scope === 'country' && userCountry) {
        query = query.ilike('location', `%${userCountry}`);
      } else if (scope === 'region' && userRegion) {
        query = query.ilike('location', `%${userRegion}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let rows = (data as FollowerLeaderboardEntry[]) || [];
      // Client-side filter as a fallback to ensure correct scoping
      if (scope === 'country' && userCountry) {
        rows = rows.filter((e) => {
          const loc = (e as any)?.location as string | undefined;
          return loc ? loc.toLowerCase().includes(userCountry.toLowerCase()) : false;
        });
      } else if (scope === 'region' && userRegion) {
        rows = rows.filter((e) => {
          const loc = (e as any)?.location as string | undefined;
          return loc ? loc.toLowerCase().includes(userRegion.toLowerCase()) : false;
        });
      }
      setFollowerLeaderboard(rows);

      if (user) {
        const userIndex = rows.findIndex((entry) => entry.user_id === user.id);
        if (userIndex !== undefined && userIndex !== -1) {
          setUserFollowerRank(userIndex + 1);
          setUserFollowerData(data[userIndex]);
        }
      }
    } catch (error) {
      console.error('Error fetching follower leaderboard:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton />

      <div>
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Top users by streaks and followers</p>

        {/* Scope Filter */}
        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Scope</label>
          <Select value={scope} onValueChange={(v) => setScope(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="country" disabled={!userCountry}>Country {userCountry ? `(${userCountry})` : ''}</SelectItem>
              <SelectItem value="region" disabled={!userRegion}>Region {userRegion ? `(${userRegion})` : ''}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="streaks" className="mt-6">
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

          <TabsContent value="streaks" className="space-y-4 mt-6">
            {user && userStreak && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Your Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage src={userStreak.profiles.avatar_url} />
                        <AvatarFallback>
                          {userStreak.profiles.display_name?.charAt(0) || userStreak.profiles.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {userStreak.profiles.display_name || userStreak.profiles.username}
                        </p>
                        <p className="text-sm text-muted-foreground">Rank #{userRank}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-2xl font-bold">{userStreak.current_streak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Current</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-2xl font-bold">{userStreak.longest_streak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Best</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Top Streaks</CardTitle>
                <CardDescription>Most consistent users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-6 w-8" />
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          entry.user_id === user?.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 flex justify-center">{getRankBadge(index + 1)}</div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={entry.profiles.avatar_url} />
                            <AvatarFallback>
                              {entry.profiles.display_name?.charAt(0) || entry.profiles.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{entry.profiles.display_name || entry.profiles.username}</p>
                            <p className="text-sm text-muted-foreground">{entry.total_active_days} active days</p>
                            {entry?.profiles && (entry as any).profiles.location ? (
                              <p className="text-xs text-muted-foreground">{(entry as any).profiles.location}</p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
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
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No streak data yet. Start using the platform to build your streak!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followers" className="space-y-4 mt-6">
            {user && userFollowerData && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage src={userFollowerData.avatar_url} />
                        <AvatarFallback>
                          {userFollowerData.display_name?.charAt(0) || userFollowerData.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{userFollowerData.display_name || userFollowerData.username}</p>
                        <p className="text-sm text-muted-foreground">Rank #{userFollowerRank}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold">{userFollowerData.followers_count}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold">{userFollowerData.following_count}</span>
                        <p className="text-xs text-muted-foreground">Following</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Top Followed Users</CardTitle>
                <CardDescription>Most followed users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followersLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-6 w-8" />
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))
                  ) : followerLeaderboard.length > 0 ? (
                    followerLeaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          entry.user_id === user?.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 flex justify-center">{getRankBadge(index + 1)}</div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={entry.avatar_url} />
                            <AvatarFallback>
                              {entry.display_name?.charAt(0) || entry.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{entry.display_name || entry.username}</p>
                            <p className="text-sm text-muted-foreground">@{entry.username}</p>
                            {entry && (entry as any).location ? (
                              <p className="text-xs text-muted-foreground">{(entry as any).location}</p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <Badge variant="secondary" className="gap-1">
                              <Users className="h-3 w-3 text-primary" />
                              {entry.followers_count}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Followers</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
