import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  BarChart3, 
  Bookmark, 
  Heart, 
  User, 
  Users, 
  Archive,
  TrendingUp,
  Eye,
  Compass,
  Settings,
  LogOut,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function HamburgerMenu() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [trendingPages, setTrendingPages] = useState<TrendingPage[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);

  const navItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Heart, label: 'Liked Pages', path: '/liked' },
    { icon: Archive, label: 'Archive', path: '/archive' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  ];

  useEffect(() => {
    if (open) {
      fetchTrendingPages();
      fetchTrendingTags();
    }
  }, [open]);

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

      const scored = (data || []).map((page) => {
        const publishedAtStr = page.published_at ?? new Date().toISOString();
        const hoursSincePublished = (Date.now() - new Date(publishedAtStr).getTime()) / (1000 * 60 * 60);
        const likes = Number(page.likes_count ?? 0);
        const bookmarks = Number(page.bookmarks_count ?? 0);
        const views = Number(page.views_count ?? 0);
        const engagementScore = (likes * 3) + (bookmarks * 5) + (views * 0.5);
        const timeDecay = Math.max(0.1, 1 / (1 + hoursSincePublished / 24));
        const score = engagementScore * timeDecay;

        return {
          id: page.id,
          title: page.title,
          likes_count: likes,
          bookmarks_count: bookmarks,
          views_count: views,
          published_at: publishedAtStr,
          score,
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

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleExploreClick = () => {
    setOpen(false);
    navigate('/explore');
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/auth');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            {/* Profile Section */}
            <div className="space-y-4">
              {profile ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={handleLinkClick}
                    className="flex flex-col items-center text-center space-y-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{profile?.display_name || profile?.username}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{profile?.bio || 'No bio yet'}</p>
                    </div>
                  </Link>
                  
                  <div className="flex justify-around text-xs border-t border-b py-3">
                    <div className="text-center">
                      <p className="font-semibold">{profile?.followers_count || 0}</p>
                      <p className="text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{profile?.following_count || 0}</p>
                      <p className="text-muted-foreground">Following</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center space-y-3">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-3 w-32 mx-auto" />
                  </div>
                  <div className="flex gap-4 pt-3 border-t border-border/50 w-full justify-center">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Separator />

            {/* Settings and Sign Out - Mobile only */}
            <div className="space-y-1 sm:hidden">
              <Link
                to="/edit-profile"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            <Separator className="sm:hidden" />

            {/* Explore Button - Mobile only shows button, Desktop shows content */}
            <div className="block sm:hidden">
              <Button 
                onClick={handleExploreClick}
                className="w-full"
                variant="default"
              >
                <Compass className="h-4 w-4 mr-2" />
                Explore Trending
              </Button>
            </div>

            {/* Trending Pages - Desktop only */}
            <div className="hidden sm:block space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Trending Pages</h3>
              </div>
              <div className="space-y-3">
                {trendingPages.length > 0 ? (
                  trendingPages.map((page, index) => (
                    <div key={page.id}>
                      <Link
                        to={`/page/${page.id}`}
                        onClick={handleLinkClick}
                        className="block group"
                      >
                        <div className="space-y-2">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {page.title}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {page.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="h-3 w-3" />
                              {page.bookmarks_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {page.views_count}
                            </span>
                          </div>
                        </div>
                      </Link>
                      {index < trendingPages.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No trending pages yet</p>
                )}
              </div>
            </div>

            <Separator className="hidden sm:block" />

            {/* Trending Tags - Desktop only */}
            <div className="hidden sm:block space-y-3">
              <h3 className="font-semibold text-sm">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.length > 0 ? (
                  trendingTags.map((tag) => (
                    <Link
                      key={tag.tag}
                      to={`/explore?tag=${encodeURIComponent(tag.tag)}`}
                      onClick={handleLinkClick}
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                      >
                        #{tag.tag} <span className="ml-1 text-xs">({tag.count})</span>
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No trending tags yet</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
