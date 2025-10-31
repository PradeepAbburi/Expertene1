import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Heart, Bookmark, TrendingUp, MessageCircle, Zap, Calendar, IndianRupee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/BackButton';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  cover_image_url?: string;
  reading_time?: number;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  comments_count: number;
  published_at?: string;
  tags: string[];
}

// Realtime boost state persisted locally per-article
type ActiveBoost = {
  startedAt: number; // epoch ms
  endAt: number;     // epoch ms
  dailyBudget: number;
};

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoosts, setActiveBoosts] = useState<Record<string, ActiveBoost>>({});
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [boostDuration, setBoostDuration] = useState(7);
  const [dailyBudget, setDailyBudget] = useState(50);
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [showPostDetailsDialog, setShowPostDetailsDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  // Load and maintain local boost state + cross-tab sync
  useEffect(() => {
    const key = 'activeBoosts:v1';
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, ActiveBoost>;
        setActiveBoosts(parsed);
      }
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setActiveBoosts(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    // interval for cleaning up expired boosts
    const interval = setInterval(() => {
      setActiveBoosts((prev) => {
        const now = Date.now();
        const next: Record<string, ActiveBoost> = {};
        let changed = false;
        for (const [id, b] of Object.entries(prev)) {
          if (b.endAt > now) {
            next[id] = b;
          } else {
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem(key, JSON.stringify(next));
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const fetchArticles = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', user.id)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Normalize data coming from Supabase so fields match the Article type
      const normalized = (data || []).map((a: any) => ({
        id: a.id ?? '',
        title: a.title ?? '',
        subtitle: a.subtitle ?? undefined,
        cover_image_url: a.cover_image_url ?? undefined,
        reading_time: a.reading_time ?? undefined,
        likes_count: a.likes_count ?? 0,
        bookmarks_count: a.bookmarks_count ?? 0,
        views_count: a.views_count ?? 0,
        comments_count: a.comments_count ?? 0,
        published_at: a.published_at ?? undefined,
        tags: (a.tags ?? []) as string[],
      })) as Article[];

      setArticles(normalized);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates on the user's articles to keep counts fresh
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('realtime-articles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'articles',
        filter: `author_id=eq.${user.id}`,
      }, () => {
        fetchArticles();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleBoost = async () => {
    // Feature temporarily disabled: show coming soon message
    toast({
      title: 'Coming soon',
      description: 'Boosting posts is coming soon. Stay tuned!',
    });
    // Ensure any open boost dialog is closed
    setShowBoostDialog(false);
  };

  const openBoostDialog = (article: Article) => {
    // Temporarily replaced with a coming soon message
    setSelectedArticle(article);
    toast({ title: 'Coming soon', description: 'Boosting posts is coming soon.' });
    // Do not open dialog
  };

  const openPostDetails = (article: Article) => {
    setSelectedArticle(article);
    setShowPostDetailsDialog(true);
  };

  const totalViews = articles.reduce((sum, a) => sum + a.views_count, 0);
  const totalLikes = articles.reduce((sum, a) => sum + a.likes_count, 0);
  const totalBookmarks = articles.reduce((sum, a) => sum + a.bookmarks_count, 0);
  const totalComments = articles.reduce((sum, a) => sum + a.comments_count, 0);

  // Compute extra impressions from active boosts, proportional to dailyBudget per minute
  const getBoostExtraImpressions = (articleId: string) => {
    const b = activeBoosts[articleId];
    if (!b) return 0;
    const now = Date.now();
    const clampedNow = Math.min(now, b.endAt);
    const minutes = Math.max(0, Math.floor((clampedNow - b.startedAt) / 60000));
    // scale: ~10 impressions per ₹ per day => per minute = (dailyBudget * 10) / 1440
    const perMinute = (b.dailyBudget * 10) / 1440;
    return Math.floor(minutes * perMinute);
  };

  const formatImpressions = (base: number, extra: number) => (base + extra).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <BackButton />
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <BackButton />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your content performance and boost your posts
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all posts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total engagement
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookmarks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Saved by readers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Conversations started
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
              <p className="text-xs text-muted-foreground">
                Published pages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Removed Performance Chart per request */}

        {/* Your Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Your Pages</CardTitle>
            <CardDescription>
              Boost your pages to reach more readers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {articles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>You haven't published any pages yet.</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/create'}>
                    Create Your First Page
                  </Button>
                </div>
              ) : (
                articles.map((article) => (
                  <Card
                    key={article.id}
                    className="overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 p-4">
                      {article.cover_image_url && (
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                          {article.subtitle && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{article.subtitle}</p>
                          )}
                        </div>
                        
                        {/* Impressions Badge (realtime with boost) */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {formatImpressions(Math.floor(article.views_count * 3.5), getBoostExtraImpressions(article.id))} impressions
                          </Badge>
                          {activeBoosts[article.id] && activeBoosts[article.id].endAt > Date.now() && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                              <Zap className="h-3 w-3 mr-1" />
                              Boost Active
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {article.views_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" /> {article.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-4 w-4" /> {article.bookmarks_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" /> {article.comments_count}
                          </span>
                        </div>
                        
                        {article.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{article.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          onClick={() => openBoostDialog(article)}
                          className="whitespace-nowrap flex-1 sm:flex-none"
                          disabled={!!activeBoosts[article.id] && activeBoosts[article.id].endAt > Date.now()}
                          variant={activeBoosts[article.id] && activeBoosts[article.id].endAt > Date.now() ? 'outline' : 'default'}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {activeBoosts[article.id] && activeBoosts[article.id].endAt > Date.now() ? 'Active' : 'Boost'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPostDetails(article)}
                          className="flex-1 sm:flex-none"
                        >
                          View Stats
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boost Dialog */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Boost Your Post
            </DialogTitle>
            <DialogDescription>
              Increase your post's visibility and reach more readers
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="space-y-6 py-4">
              {/* Post Preview */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {selectedArticle.cover_image_url && (
                  <img
                    src={selectedArticle.cover_image_url}
                    alt={selectedArticle.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-sm">{selectedArticle.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedArticle.published_at ?? Date.now()))} ago
                  </p>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Duration
                  </Label>
                  <span className="text-sm font-medium">{boostDuration} days</span>
                </div>
                <Slider
                  value={[boostDuration]}
                  onValueChange={(v) => setBoostDuration(v[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>

              {/* Daily Budget Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Daily Budget
                  </Label>
                  <span className="text-sm font-medium">₹{dailyBudget}/day</span>
                </div>
                <Slider
                  value={[dailyBudget]}
                  onValueChange={(v) => setDailyBudget(v[0])}
                  min={50}
                  max={1000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹50</span>
                  <span>₹1000</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{boostDuration} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily Budget</span>
                  <span className="font-medium">₹{dailyBudget}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Cost</span>
                    <span className="font-bold text-primary">₹{dailyBudget * boostDuration}</span>
                  </div>
                </div>
              </div>

              {/* Expected Reach */}
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Expected Reach</p>
                <p className="text-2xl font-bold">
                  {(dailyBudget * boostDuration * 10).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">impressions</span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBoost} className="gap-2">
              <Zap className="h-4 w-4" />
              Boost Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Details Dialog */}
      <Dialog open={showPostDetailsDialog} onOpenChange={setShowPostDetailsDialog}>
        <DialogContent className="max-w-4xl p-6 gap-6 max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-2xl mb-2">
                    {selectedArticle.title}
                  </h3>
                  {selectedArticle.subtitle && (
                    <p className="text-muted-foreground mb-2">
                      {selectedArticle.subtitle}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Published {formatDistanceToNow(new Date(selectedArticle.published_at ?? Date.now()))} ago
                  </p>
                </div>
              </div>

              {/* Impressions Hero */}
              <div className="relative rounded-xl overflow-hidden bg-primary/10 border border-primary/20 p-8">
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold text-primary">
                      Total Impressions
                    </span>
                  </div>
                  <div className="text-5xl font-bold text-primary mb-2">
                    {(selectedArticle.views_count * 3.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-muted-foreground">
                    Times your post appeared in feeds
                  </div>
                </div>
              </div>

              {/* Stats Grid - 4 columns */}
              <div className="grid grid-cols-4 gap-4">
                {/* Views */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {selectedArticle.views_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Views</div>
                      <div className="text-xs text-muted-foreground">
                        {((selectedArticle.views_count / (selectedArticle.views_count * 3.5)) * 100).toFixed(1)}% engaged
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Likes */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {selectedArticle.likes_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Likes</div>
                      <div className="text-xs text-muted-foreground">
                        {((selectedArticle.likes_count / selectedArticle.views_count) * 100).toFixed(1)}% rate
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bookmarks */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Bookmark className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {selectedArticle.bookmarks_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Saves</div>
                      <div className="text-xs text-muted-foreground">
                        {((selectedArticle.bookmarks_count / selectedArticle.views_count) * 100).toFixed(1)}% saved
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {selectedArticle.comments_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Comments</div>
                      <div className="text-xs text-muted-foreground">
                        Discussions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      Your post reached <span className="font-semibold text-foreground">
                        {(selectedArticle.views_count * 3.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })} people
                      </span> through impressions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        {((selectedArticle.views_count / (selectedArticle.views_count * 3.5)) * 100).toFixed(1)}%
                      </span> engagement rate - people who saw it and clicked to view the full post
                    </p>
                  </div>
                  {selectedArticle.likes_count > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">
                          {((selectedArticle.likes_count / selectedArticle.views_count) * 100).toFixed(1)}%
                        </span> of viewers loved your content and gave it a like
                      </p>
                    </div>
                  )}
                  {selectedArticle.bookmarks_count > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">
                          {((selectedArticle.bookmarks_count / selectedArticle.views_count) * 100).toFixed(1)}%
                        </span> of viewers saved your post to read later or reference
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {selectedArticle.tags.length > 0 && (
                <div>
                  <Label className="text-sm mb-3 block font-semibold">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`/page/${selectedArticle.id}`, '_blank')}
                >
                  Open Post
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setShowPostDetailsDialog(false);
                    openBoostDialog(selectedArticle);
                  }}
                >
                  <Zap className="h-4 w-4" />
                  Boost This Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}