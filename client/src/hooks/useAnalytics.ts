import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string | null | undefined;
  article_id?: string | null | undefined;
  target_user_id?: string | null | undefined;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const track = async (event: AnalyticsEvent) => {
    try {
      await supabase.functions.invoke('analytics', {
        body: event
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackArticleView = async (articleId: string) => {
    // Only track analytics here. Incrementing the article views is handled
    // in the article page component itself to ensure it runs exactly once
    // per page load (and is guarded by localStorage/ref).
    track({
      event_type: 'article_view',
      article_id: articleId,
    });
  };

  const trackArticleLike = (articleId: string) => {
    track({
      event_type: 'article_like',
      article_id: articleId,
    });
  };

  const trackArticleBookmark = (articleId: string) => {
    track({
      event_type: 'article_bookmark',
      article_id: articleId,
    });
  };

  const trackUserFollow = (targetUserId: string) => {
    track({
      event_type: 'user_follow',
      target_user_id: targetUserId,
    });
  };

  const trackUserProfile = (targetUserId: string) => {
    track({
      event_type: 'profile_view',
      target_user_id: targetUserId,
    });
  };

  const trackSearch = (query: string, results: number) => {
    track({
      event_type: 'search',
      metadata: { query, results },
    });
  };

  return {
    track,
    trackArticleView,
    trackArticleLike,
    trackArticleBookmark,
    trackUserFollow,
    trackUserProfile,
    trackSearch,
  };
}