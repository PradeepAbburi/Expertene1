import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Heart, Bookmark, Eye } from 'lucide-react';

interface TrendingPage {
  id: string | null | undefined;
  title: string | null | undefined;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  published_at: string | null | undefined;
  score: number;
}

interface TrendingTag {
  tag: string | null | undefined;
  count: number;
}

export function RightSidebar() {
  const [trendingPages, setTrendingPages] = useState<TrendingPage[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTrendingPages(), fetchTrendingTags()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchTrendingPages = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, likes_count, bookmarks_count, views_count, published_at')
        .eq('is_published', true)
        .eq('is_private', false)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Calculate trending score based on engagement and recency
      const scored = (data || []).map((page) => {
        const hoursSincePublished = (Date.now() - new Date(page.published_at || Date.now()).getTime()) / (1000 * 60 * 60);
        const engagementScore = ((page.likes_count || 0) * 3) + ((page.bookmarks_count || 0) * 5) + ((page.views_count || 0) * 0.5);
        const timeDecay = Math.max(0.1, 1 / (1 + hoursSincePublished / 24));
        const score = engagementScore * timeDecay;

        return {
          id: page.id,
          title: page.title || '',
          likes_count: page.likes_count || 0,
          bookmarks_count: page.bookmarks_count || 0,
          views_count: page.views_count || 0,
          published_at: page.published_at || new Date().toISOString(),
          score
        } as TrendingPage;
      });

      scored.sort((a, b) => b.score - a.score);
      setTrendingPages(scored.slice(0, 5));
    } catch (error) {
      console.error('Error fetching trending pages:', error);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('tags')
        .eq('is_published', true)
        .eq('is_private', false);

      if (error) throw error;

      const tagCounts: { [key: string]: number } = {};
      data?.forEach((article) => {
        article.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingTags(sortedTags);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base">Trending Pages</h3>
        </div>
        <div className="space-y-4">
          {loading ? (
            // Skeleton loading for trending pages
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="space-y-2.5 py-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-3 mt-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
                {i < 4 && <Separator className="my-3" />}
              </div>
            ))
          ) : trendingPages.length > 0 ? (
            trendingPages.map((page, index) => (
              <div key={page.id}>
                <Link
                  to={`/page/${page.id}`}
                  className="block group py-1.5"
                >
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {page.title}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Heart className="h-3.5 w-3.5" />
                        {page.likes_count}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Bookmark className="h-3.5 w-3.5" />
                        {page.bookmarks_count}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                        {page.views_count}
                      </span>
                    </div>
                  </div>
                </Link>
                {index < trendingPages.length - 1 && <Separator className="my-3" />}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No trending pages yet</p>
          )}
        </div>
        {/* More button linking to Explore */}
        <div className="pt-4">
          <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10">
            <Link to="/explore">More</Link>
          </Button>
        </div>
      </Card>

      <Card className="p-5 shadow-sm">
        <h3 className="font-bold text-base mb-4">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            // Skeleton loading for tags
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))
          ) : trendingTags.length > 0 ? (
            trendingTags.map((tag) => (
              <Link
                key={tag.tag}
                to={`/explore?tag=${encodeURIComponent(tag.tag)}`}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all text-xs font-medium px-3 py-1.5"
                >
                  #{tag.tag} <span className="ml-1.5 opacity-70">({tag.count})</span>
                </Badge>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4 w-full">No trending tags yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
