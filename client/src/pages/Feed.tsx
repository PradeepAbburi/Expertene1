import { useState } from 'react';
import { PageCard } from '@/components/PageCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
// ...existing code...
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { FeedSkeleton } from '@/components/FeedSkeleton';
import { Clock, Heart, Bookmark, TrendingUp } from 'lucide-react';

type SortOption = 'latest' | 'most_liked' | 'most_bookmarked' | 'trending';

// ...existing code...

export default function Feed() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Use React Query for all articles with caching and auto-refetch
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', 'all', sortBy],
    queryFn: async () => {
      let query = supabase
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
        .eq('is_published', true)
        .eq('is_archived', false)
        .limit(20);

      // Apply sorting based on selected option
      switch (sortBy) {
        case 'latest':
          query = query.order('published_at', { ascending: false });
          break;
        case 'most_liked':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'most_bookmarked':
          query = query.order('bookmarks_count', { ascending: false });
          break;
        case 'trending':
          query = query.order('views_count', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Use React Query for following articles with caching
  const { data: followingArticles = [], isLoading: followingLoading } = useQuery({
    queryKey: ['articles', 'following', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the list of users being followed
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followsError) throw followsError;

      const followingIds = follows?.map(f => f.following_id) || [];

      if (followingIds.length === 0) {
        return [];
      }

      // Then get articles from those users
      const { data, error } = await supabase
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
          author_id,
          profiles:author_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .eq('is_archived', false)
        .in('author_id', followingIds)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user, // Only run when user is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  const loading = articlesLoading;

  return (
    <div className="space-y-6">
  <div className="flex items-center justify-between pt-16 sm:pt-0">
        <h1 className="text-3xl font-bold">Your Feed</h1>
        {/* Filter Options */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Latest
              </div>
            </SelectItem>
            <SelectItem value="most_liked">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Most Liked
              </div>
            </SelectItem>
            <SelectItem value="most_bookmarked">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Most Bookmarked
              </div>
            </SelectItem>
            <SelectItem value="trending">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* ...existing code... */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeedSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {articles.map((article) => (
                <PageCard key={article.id} page={{
                  ...article,
                  subtitle: article.subtitle ?? undefined,
                  cover_image_url: article.cover_image_url ?? undefined,
                  reading_time: article.reading_time ?? undefined,
                  likes_count: article.likes_count ?? 0,
                  bookmarks_count: article.bookmarks_count ?? 0,
                  views_count: article.views_count ?? 0,
                  comments_count: article.comments_count ?? 0,
                  published_at: typeof article.published_at === 'string' ? article.published_at : '',
                  tags: article.tags ?? [],
                  profiles: {
                    ...article.profiles,
                    display_name: article.profiles?.display_name ?? '',
                    avatar_url: article.profiles?.avatar_url ?? undefined
                  }
                }} />
              ))}
              {articles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-6">
          {followingLoading ? (
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeedSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {followingArticles.map((article) => (
                <PageCard key={article.id} page={{
                  ...article,
                  subtitle: article.subtitle ?? undefined,
                  cover_image_url: article.cover_image_url ?? undefined,
                  reading_time: article.reading_time ?? undefined,
                  likes_count: article.likes_count ?? 0,
                  bookmarks_count: article.bookmarks_count ?? 0,
                  views_count: article.views_count ?? 0,
                  comments_count: article.comments_count ?? 0,
                  published_at: typeof article.published_at === 'string' ? article.published_at : '',
                  tags: article.tags ?? [],
                  profiles: {
                    ...article.profiles,
                    display_name: article.profiles?.display_name ?? '',
                    avatar_url: article.profiles?.avatar_url ?? undefined
                  }
                }} />
              ))}
              {followingArticles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No articles from people you follow. Start following writers to see their content here.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}