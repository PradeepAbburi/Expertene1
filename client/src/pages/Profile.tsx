import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageCard } from '@/components/PageCard';
import { UserPlus, UserMinus, MapPin, Globe, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { TasksPanel } from '@/components/TasksPanel';
import { useGamification } from '@/hooks/useGamification';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';

interface ProfileData {
  user_id: string | null | undefined;
  username: string | null | undefined;
  display_name: string | null | undefined;
  bio?: string | null | undefined;
  avatar_url?: string | null | undefined;
  website_url?: string | null | undefined;
  location?: string | null | undefined;
  followers_count: number;
  following_count: number;
  articles_count: number;
}

interface Article {
  id: string | null | undefined;
  title: string | null | undefined;
  subtitle?: string | null | undefined;
  cover_image_url?: string | null | undefined;
  reading_time?: number;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  comments_count: number;
  published_at: string | null | undefined;
  tags: string[];
  profiles: {
    user_id: string | null | undefined;
    username: string | null | undefined;
    display_name: string | null | undefined;
    avatar_url?: string | null | undefined;
  };
}

export default function Profile() {
  const { username } = useParams<{ username?: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);

  // Fetch profile data with React Query
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username || user?.id],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*');
      
      if (username) {
        query = query.eq('username', username);
      } else if (user) {
        query = query.eq('user_id', user.id);
      } else {
        return null;
      }

      const { data: profileData, error: profileError } = await query.single();
      if (profileError) throw profileError;
      return profileData as ProfileData;
    },
    enabled: !!(username || user),
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  // Fetch articles with React Query
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['profile-articles', profile?.user_id],
    queryFn: async () => {
      if (!profile) return [];

      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          subtitle,
          cover_image_url,
          reading_time,
          likes_count,
          bookmarks_count,
          views_count,
          comments_count,
          published_at,
          tags,
          profiles:author_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('author_id', profile.user_id)
        .eq('is_published', true)
        .eq('is_archived', false)
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;
      
      // Update articles count in profile if it's different
      const actualCount = articlesData?.length || 0;
      if (actualCount !== profile.articles_count) {
        await supabase
          .from('profiles')
          .update({ articles_count: actualCount })
          .eq('user_id', profile.user_id);
      }
      
      return articlesData || [];
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 2,
  });

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && profile && profile.user_id !== user.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id)
          .single();
        setIsFollowing(!!followData);
      }
    };
    checkFollowStatus();
  }, [user, profile]);

  // Calculate badges
  useEffect(() => {
    if (profile) {
      const earnedBadges = [
        { name: 'First Post', earned: profile.articles_count >= 1 },
        { name: 'Prolific Writer', earned: profile.articles_count >= 5 },
        { name: 'Influencer', earned: profile.followers_count >= 50 }
      ].filter(badge => badge.earned);
      setBadges(earnedBadges);
    }
  }, [profile]);

  const isOwnProfile = !username || (profile && user?.id === profile.user_id);
  const handleFollow = async () => {
    if (!isAuthenticated || !profile) return;

    // Optimistic update
    const previousFollowState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      if (previousFollowState) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user?.id)
          .eq('following_id', profile.user_id);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user?.id, following_id: profile.user_id });
      }
      
      // Invalidate profile query to refresh follower count
      queryClient.invalidateQueries({ queryKey: ['profile', username || user?.id] });
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowing(previousFollowState);
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton />
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {profileLoading ? (
            // Skeleton for profile section only
            <div className="flex items-start space-x-6">
              <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-6 pt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ) : profile ? (
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">
                      {profile.display_name || profile.username}
                    </h1>
                    {profile.display_name && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                </div>

                {/* Follow Stats */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-4">
                  <div className="whitespace-nowrap">
                    <span className="font-semibold">{profile.followers_count}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </div>
                  <div className="whitespace-nowrap">
                    <span className="font-semibold">{profile.following_count}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </div>
                  <div className="whitespace-nowrap">
                    <span className="font-semibold">{profile.articles_count || 0}</span>
                    <span className="text-muted-foreground ml-1">Pages</span>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}
                
                {/* Location and Website */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website_url && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile && (
                    <Button asChild variant="outline">
                      <Link to="/edit-profile">
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                  {!isOwnProfile && isAuthenticated && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Profile not found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles">Pages</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles" className="mt-6">
          <div className="grid gap-6">
            {articlesLoading ? (
              // Skeleton loading for articles
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Skeleton className="h-48 w-full rounded-md" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex gap-4 pt-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <PageCard
                  key={article.id}
                  page={article}
                  showOwnerMenu={isOwnProfile}
                  onEdit={(id) => (window.location.href = `/create?edit=${id}`)}
                  onArchive={async (id) => {
                    try {
                      const { error } = await supabase
                        .from('articles')
                        .update({ is_published: false })
                        .eq('id', id)
                        .eq('author_id', user?.id);
                      if (error) throw error;
                      toast({ title: 'Archived', description: 'Post moved to drafts.' });
                      // refetch
                      window.location.reload();
                    } catch (e: any) {
                      toast({ title: 'Error', description: e.message, variant: 'destructive' });
                    }
                  }}
                  onDelete={async (id) => {
                    if (!confirm('Delete this post? This cannot be undone.')) return;
                    try {
                      const { error } = await supabase
                        .from('articles')
                        .delete()
                        .eq('id', id)
                        .eq('author_id', user?.id);
                      if (error) throw error;
                      toast({ title: 'Deleted', description: 'Post has been removed.' });
                      // refetch
                      window.location.reload();
                    } catch (e: any) {
                      toast({ title: 'Error', description: e.message, variant: 'destructive' });
                    }
                  }}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't published any pages yet." : "No pages published yet."}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  {profileLoading ? (
                    // Skeleton loading for about section
                    <div className="space-y-6">
                      <div>
                        <Skeleton className="h-5 w-16 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ) : profile ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Bio</h3>
                        <p className="text-muted-foreground">
                          {profile.bio || "No bio available."}
                        </p>
                      </div>
                      
                      {profile.location && (
                        <div>
                          <h3 className="font-semibold mb-2">Location</h3>
                          <p className="text-muted-foreground">{profile.location}</p>
                        </div>
                      )}
                      
                      {profile.website_url && (
                        <div>
                          <h3 className="font-semibold mb-2">Website</h3>
                          <a
                            href={profile.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {profile.website_url}
                          </a>
                        </div>
                      )}
                      
                      {badges.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Achievements
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {badges.map((badge, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {badge.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
            
            {/* Analytics/Tasks Section */}
            {isOwnProfile && (
              <div className="space-y-6">
                <TasksPanel />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}