import { useEffect, useState } from 'react';
import { PageCard } from '@/components/PageCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/BackButton';
import { Heart } from 'lucide-react';

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

export default function Liked() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchLikedArticles(user.id);
    }
  }, [user]);

  const fetchLikedArticles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          articles!inner (
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
            is_archived,
            profiles:author_id (
              user_id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Only filter if is_archived property exists
      const likedArticles = data?.map(item => item.articles).filter(a => a && (a.is_archived === false || a.is_archived === undefined)) || [];
      setArticles(likedArticles as Article[]);
    } catch (error) {
      console.error('Error fetching liked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <BackButton />
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <BackButton />
      
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-3xl font-bold">Liked Articles</h1>
      </div>
      
      <div className="grid gap-6">
        {articles.map((article) => (
          <PageCard key={article.id} page={article} />
        ))}
        {articles.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No liked articles yet</h2>
            <p className="text-muted-foreground">
              Start liking articles you enjoy. They'll appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}