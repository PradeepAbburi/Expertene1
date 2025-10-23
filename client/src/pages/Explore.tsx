import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageCard } from '@/components/PageCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/BackButton';

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
    username: string | null;
    display_name: string | null;
    avatar_url?: string | null;
  };
}

type RawArticle = {
  id: string | null | undefined;
  title: string | null | undefined;
  subtitle: string | null;
  cover_image_url: string | null;
  reading_time: number | null;
  likes_count: number | null;
  bookmarks_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  published_at: string | null;
  tags: string[] | null;
  profiles: {
    user_id: string | null | undefined;
    username: string | null;
    display_name: string | null;
    avatar_url?: string | null;
  };
};

export default function Explore() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  // Get tag from URL params
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [searchParams]); // Re-run when search params change

  useEffect(() => {
    fetchArticles();
    fetchTrendingArticles();
    fetchPopularTags();
  }, []);

  useEffect(() => {
    if (searchTerm || selectedTag) {
      searchArticles();
    } else {
      fetchArticles();
    }
  }, [searchTerm, selectedTag]);

  const transformArticle = (article: RawArticle): Article => ({
    ...article,
    subtitle: article.subtitle || undefined,
    cover_image_url: article.cover_image_url || undefined,
    reading_time: article.reading_time || undefined,
    likes_count: article.likes_count || 0,
    bookmarks_count: article.bookmarks_count || 0,
    views_count: article.views_count || 0,
    comments_count: article.comments_count || 0,
    published_at: article.published_at || new Date().toISOString(),
    tags: article.tags || []
  });

  const fetchArticles = async () => {
    try {
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
          profiles:author_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .eq('is_archived', false)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setArticles((data || []).map(transformArticle));
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingArticles = async () => {
    try {
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
          profiles:author_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .eq('is_archived', false)
        .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('views_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrendingArticles((data || []).map(transformArticle));
    } catch (error) {
      console.error('Error fetching trending articles:', error);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('tags')
        .eq('is_published', true);

      if (error) throw error;

      const tagCounts: { [key: string]: number } = {};
      data?.forEach(article => {
        article.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag]) => tag);

      setPopularTags(sortedTags);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
    }
  };

  const searchArticles = async () => {
    try {
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
        .eq('is_published', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%`);
      }

      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      const { data, error } = await query
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setArticles((data || []).map(transformArticle));
    } catch (error) {
      console.error('Error searching articles:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
    setSearchParams(new URLSearchParams());
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Explore Articles</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Popular Tags */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => {
                  if (selectedTag === tag) {
                    setSelectedTag(null);
                    setSearchParams(new URLSearchParams());
                  } else {
                    setSelectedTag(tag);
                    setSearchParams(new URLSearchParams({ tag }));
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
          {(searchTerm || selectedTag) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-3"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="latest" className="w-full">
        <TabsList>
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="latest" className="mt-6">
          <div className="grid gap-6">
            {articles.map((article) => (
              <PageCard key={article.id} page={{
                ...article,
                profiles: {
                  ...article.profiles,
                  username: article.profiles.username || '',
                  display_name: article.profiles.display_name || '',
                  avatar_url: article.profiles.avatar_url || undefined
                }
              }} />
            ))}
            {articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm || selectedTag ? "No articles found matching your criteria." : "No articles available."}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="trending" className="mt-6">
          <div className="grid gap-6">
            {trendingArticles.map((article) => (
              <PageCard key={article.id} page={{
                ...article,
                profiles: {
                  ...article.profiles,
                  username: article.profiles.username || '',
                  display_name: article.profiles.display_name || '',
                  avatar_url: article.profiles.avatar_url || undefined
                }
              }} />
            ))}
            {trendingArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No trending articles this week.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}