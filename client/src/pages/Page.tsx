import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Bookmark, Share2, Eye, UserPlus, UserMinus, MoreVertical, Archive, Trash2, Edit, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSection } from '@/components/CommentSection';
import { BackButton } from '@/components/BackButton';
import CodePreview from '@/components/CodePreview';
import MentionedHtml from '@/components/MentionedHtml';
// Removed html2canvas and PDF-related code; replaced with Report option
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PageData {
  id: string | null | undefined;
  title: string | null | undefined;
  subtitle?: string | null | undefined;
  content: any;
  cover_image_url?: string | null | undefined;
  reading_time?: number;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  comments_count: number;
  published_at: string | null | undefined;
  tags: string[];
  author_id: string | null | undefined;
  profiles: {
    username: string | null | undefined;
    display_name: string | null | undefined;
    avatar_url?: string | null | undefined;
    bio?: string | null | undefined;
    followers_count: number;
  };
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackArticleView, trackArticleLike, trackArticleBookmark } = useAnalytics();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('token');
  const from = searchParams.get('from');
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Ref to ensure we only increment once per page load
  const runOnceRef = useRef(false);

  // Fetch the page data by id and increment view count
  const fetchPage = async () => {
    if (!id && !shareToken) return;
    setLoading(true);
    try {
      if (!id) throw new Error('Missing page id');
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          subtitle,
          content,
          cover_image_url,
          reading_time,
          likes_count,
          bookmarks_count,
          views_count,
          comments_count,
          published_at,
          tags,
          author_id,
          profiles:profiles(
            username,
            display_name,
            avatar_url,
            bio,
            followers_count
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Page not found');

      setPage(data as PageData);

      // Increment views once immediately after loading the page.
      try {
        // Prevent multiple increments if fetchPage somehow runs more than once
        if (!runOnceRef.current) {
          // Debounce via sessionStorage: if we incremented this article very
          // recently (e.g. due to dev double-mount), skip the increment.
          const storageKey = `last_view_increment_${data.id}`;
          let last: string | null = null;
          try { last = sessionStorage.getItem(storageKey); } catch {}
          const now = Date.now();
          const debounceMs = 5000; // 5 seconds

          if (last && (now - Number(last) < debounceMs)) {
            console.debug('[views] skipping increment due to recent increment', { id: data.id });
            runOnceRef.current = true;
          } else {
            runOnceRef.current = true;
            // Mark that an increment has started for this tab immediately
            try { sessionStorage.setItem(storageKey, String(now)); } catch {}

            const { error: rpcError } = await supabase.rpc('increment_article_views', { article_id_param: data.id });
            if (rpcError) {
              console.error('RPC increment_article_views error in fetchPage:', rpcError);
              // Fallback: try direct update
              try {
                const newViews = Number(data.views_count ?? 0) + 1;
                const { error: updErr } = await supabase
                  .from('articles')
                  .update({ views_count: newViews })
                  .eq('id', data.id);
                if (!updErr) {
                  setPage(prev => prev ? { ...prev, views_count: newViews } : prev);
                } else {
                  console.error('Fallback update failed in fetchPage:', updErr);
                }
              } catch (updEx) {
                console.error('Fallback update exception in fetchPage:', updEx);
              }
            } else {
              // Re-fetch the updated value to ensure correctness
              try {
                const { data: refreshed, error: selectError } = await supabase
                  .from('articles')
                  .select('views_count')
                  .eq('id', data.id)
                  .single();
                if (!selectError && refreshed) {
                  setPage(prev => prev ? { ...prev, views_count: Number(refreshed.views_count ?? prev.views_count) } : prev);
                  try { sessionStorage.setItem(storageKey, String(now)); } catch {}
                }
              } catch (selEx) {
                console.error('Error fetching refreshed views_count:', selEx);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error incrementing views in fetchPage:', e);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast({
        title: 'Error',
        description: "Failed to load page or you don't have permission to view it.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id && !shareToken) return;

    // If auth state is known and user is not authenticated,
    // redirect to the auth page and preserve the original URL so
    // the visitor can sign up / login and be returned to this page.
    if (!authLoading && !isAuthenticated) {
      const current = window.location.pathname + window.location.search;
      navigate(`/auth?redirect=${encodeURIComponent(current)}`);
      return;
    }

    // Otherwise fetch the page normally.
    fetchPage();
    if (id) trackArticleView(id);
  }, [id, shareToken, authLoading, isAuthenticated, navigate]);

  

  useEffect(() => {
    if (page && user) {
      checkUserInteractions();
    }
  }, [page, user]);

  // Realtime subscriptions for likes, bookmarks, and views
  useEffect(() => {
    if (!id) return;

    const likesChannel = supabase
      .channel(`likes-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `article_id=eq.${id}`,
        },
        async () => {
          const { data } = await supabase
            .from('articles')
            .select('likes_count, bookmarks_count, views_count')
            .eq('id', id)
            .single();
          if (data && page) {
            setPage({
              ...page,
              likes_count: Number(data.likes_count ?? page.likes_count),
              bookmarks_count: Number(data.bookmarks_count ?? page.bookmarks_count),
              views_count: Number(data.views_count ?? page.views_count),
            } as PageData);
          }
        }
      )
      .subscribe();

    const bookmarksChannel = supabase
      .channel(`bookmarks-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `article_id=eq.${id}`,
        },
        async () => {
          const { data } = await supabase
            .from('articles')
            .select('likes_count, bookmarks_count, views_count')
            .eq('id', id)
            .single();
          if (data && page) {
            setPage({
              ...page,
              likes_count: Number(data.likes_count ?? page.likes_count),
              bookmarks_count: Number(data.bookmarks_count ?? page.bookmarks_count),
              views_count: Number(data.views_count ?? page.views_count),
            } as PageData);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(bookmarksChannel);
      } catch {}
    };
  }, [id, page]);

  const checkUserInteractions = async () => {
    if (!user || !page) return;

    try {
      const [likesData, bookmarksData, followsData] = await Promise.all([
        supabase
          .from('likes')
          .select('id')
          .eq('user_id', user?.id ?? '')
          .eq('article_id', page?.id ?? '')
          .single(),
        supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user?.id ?? '')
          .eq('article_id', page?.id ?? '')
          .single(),
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user?.id ?? '')
          .eq('following_id', page?.author_id ?? '')
          .single(),
      ]);

      setIsLiked(!!likesData.data);
      setIsBookmarked(!!bookmarksData.data);
      setIsFollowing(!!followsData.data);
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !page) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user?.id ?? '')
          .eq('article_id', page?.id ?? '');
      } else {
        if (user?.id && page?.id) {
          await supabase
            .from('likes')
            .insert({ user_id: user.id, article_id: page.id });
          // Track like analytics
          trackArticleLike(page.id);
        }
      }
      setIsLiked(!isLiked);
      setPage(prev => prev ? {
        ...prev,
        likes_count: prev.likes_count + (isLiked ? -1 : 1)
      } : null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated || !page) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user?.id ?? '')
          .eq('article_id', page?.id ?? '');
      } else {
        if (user?.id && page?.id) {
          await supabase
            .from('bookmarks')
            .insert({ user_id: user.id, article_id: page.id });
          // Track bookmark analytics
          trackArticleBookmark(page.id);
        }
      }
      setIsBookmarked(!isBookmarked);
      setPage(prev => prev ? {
        ...prev,
        bookmarks_count: prev.bookmarks_count + (isBookmarked ? -1 : 1)
      } : null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !page) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user?.id ?? '')
          .eq('following_id', page?.author_id ?? '');
      } else {
        if (user?.id && page?.author_id) {
          await supabase
            .from('follows')
            .insert({ follower_id: user.id, following_id: page.author_id });
        }
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: page?.title ?? '',
        text: page?.subtitle ?? '',
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Page link has been copied to clipboard.",
      });
    }
  };
  // Submit a report for this page
  const submitReport = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please sign in', description: 'You must be signed in to report content', variant: 'destructive' });
      return;
    }
    if (!page) return;
    try {
      if (page?.id && user?.id) {
        await (supabase as any)
          .from('content_reports')
          .insert({
            reported_item_type: 'page',
            reported_item_id: page.id,
            reporter_user_id: user.id,
            reason: reportReason || 'Inappropriate or spam',
            status: 'pending',
          });
        toast({ title: 'Report submitted', description: 'Our team will review this content shortly.' });
        setReportOpen(false);
        setReportReason('');
      }
    } catch (e: any) {
      toast({ title: 'Failed to submit report', description: e.message, variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!page) return;
    try {
      if (page?.id) {
        const { error } = await supabase
          .from('articles')
          .update({ is_archived: true })
          .eq('id', page.id);
        if (error) throw error;
        toast({ title: 'Archived', description: 'Page moved to archive.' });
        // Optionally redirect or update UI
      }
    } catch (error) {
      console.error('Error archiving article:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive page',
        variant: 'destructive',
      });
    }
  };

  const articleRef = useRef<HTMLElement | null>(null);

  const handleDelete = async () => {
    if (!page) return;

    try {
      if (page?.id) {
        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', page.id);

        if (error) throw error;

        toast({ title: 'Page deleted successfully' });
        navigate('/feed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="mb-6">
            <div className="prose prose-lg max-w-none" >
              <MentionedHtml html={block.content} />
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={index} className="mb-6">
            {block.content.sideTextEnabled ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch min-h-[240px]">
                  { (block.content.sidePosition || 'right') === 'left' ? (
                    <>
                      {/* Text first, Image second */}
                      <div className="md:col-span-2 h-full">
                        <div className="prose prose-lg max-w-none h-full">
                          <div className="h-full" dangerouslySetInnerHTML={{ __html: block.content.sideText || '' }} />
                        </div>
                      </div>
                      <div className="md:col-span-1 h-full">
                        <div className="w-full h-full overflow-hidden rounded-lg shadow-sm">
                          <img
                            src={block.content.url}
                            alt={block.content.alt || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Image first, Text second */}
                      <div className="md:col-span-1 h-full">
                        <div className="w-full h-full overflow-hidden rounded-lg shadow-sm">
                          <img
                            src={block.content.url}
                            alt={block.content.alt || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 h-full">
                        <div className="prose prose-lg max-w-none h-full">
                          <div className="h-full" dangerouslySetInnerHTML={{ __html: block.content.sideText || '' }} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {block.content.caption && (
                  <p className="text-sm text-muted-foreground mt-2 text-center italic">
                    {block.content.caption}
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-center">
                <div style={{ maxWidth: `${block.content.width || 100}%` }} className="w-full">
                  <img
                    src={block.content.url}
                    alt={block.content.alt || ''}
                    className="w-full rounded-lg shadow-sm mx-auto object-contain"
                    style={{ maxHeight: '75svh' }}
                  />
                  {block.content.caption && (
                    <p className="text-sm text-muted-foreground mt-2 text-center italic">
                      {block.content.caption}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div key={index} className="mb-6">
            <div className="aspect-video rounded-lg overflow-hidden">
              {(() => {
                // YouTube embed logic
                if (block.content.url.includes('youtube.com') || block.content.url.includes('youtu.be')) {
                  let videoId = '';
                  const ytMatch = block.content.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
                  if (ytMatch && ytMatch[1]) {
                    videoId = ytMatch[1];
                  } else if (block.content.url.includes('watch?v=')) {
                    videoId = block.content.url.split('watch?v=')[1].split('&')[0];
                  } else if (block.content.url.includes('youtu.be/')) {
                    videoId = block.content.url.split('youtu.be/')[1].split('?')[0];
                  }
                  if (videoId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    );
                  }
                  // fallback: show link
                  return <a href={block.content.url} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>;
                }
                // Vimeo embed logic
                if (block.content.url.includes('vimeo.com')) {
                  let videoId = '';
                  const vimeoMatch = block.content.url.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch && vimeoMatch[1]) {
                    videoId = vimeoMatch[1];
                  }
                  if (videoId) {
                    return (
                      <iframe
                        src={`https://player.vimeo.com/video/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="Vimeo video player"
                        allow="autoplay; fullscreen; picture-in-picture"
                      />
                    );
                  }
                  // fallback: show link
                  return <a href={block.content.url} target="_blank" rel="noopener noreferrer">Watch on Vimeo</a>;
                }
                // Direct video
                return (
                  <video
                    src={block.content.url}
                    controls
                    className="w-full h-full"
                  />
                );
              })()}
            </div>
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      case 'code':
        return (
          <div key={index}>
            <CodePreview code={block.content.code ?? ''} language={block.content.language} label={block.content.label ?? undefined} collapseLines={15} />
          </div>
        );
      case 'table':
        return (
          <div key={index} className="mb-6 overflow-auto max-h-[75svh] flex justify-center">
            <div style={{ width: `${block.content.width || 100}%` }}>
            <table className="w-full border-collapse border border-border">
              {(() => {
                const colCount = block.content.headers?.length || 0;
                const colWidths = block.content.colWidths && block.content.colWidths.length === colCount
                  ? block.content.colWidths
                  : new Array(colCount).fill(colCount ? 100 / colCount : 0);
                return (
                  <colgroup>
                    {colWidths.map((w: number, i: number) => (
                      <col key={i} style={{ width: `${w}%` }} />
                    ))}
                  </colgroup>
                );
              })()}
              <thead>
                <tr className="bg-muted/50">
                  {block.content.headers?.map((header: string, i: number) => (
                    <th key={i} className="border border-border p-3 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.content.rows?.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="border border-border p-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        );
      case 'spacer':
        return (
          <div key={index} style={{ height: `${block.content?.height ?? 24}px` }} />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
  <article ref={articleRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-0">
    <div className="flex items-center justify-between mb-4">
        <BackButton to={from === 'archive' ? '/archive' : undefined} />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setReportOpen(true)}
            title="Report"
          >
            <Flag className="h-4 w-4 text-amber-600" />
          </Button>
          {user?.id === page.author_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/create?edit=${page.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Page Header */}
      <header className="mb-8">
  {/* Author Info */}
  <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={page.profiles.avatar_url ?? ''} />
              <AvatarFallback>
                {page.profiles.display_name?.charAt(0) || page.profiles.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {page.profiles.display_name || page.profiles.username}
              </p>
              <div className="text-sm text-muted-foreground">
                {page.published_at ? formatDistanceToNow(new Date(page.published_at)) : ''} ago
                {page.reading_time && ` · ${page.reading_time} min read`}
                <span className="mx-1">·</span>
                <span className="inline-flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {page.views_count} views
                </span>
              </div>
              {page.profiles.bio && (
                <p className="text-sm text-muted-foreground mt-1">{page.profiles.bio}</p>
              )}
            </div>
          </div>
          
          {isAuthenticated && user?.id !== page.author_id && (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? "outline" : "default"}
              size="sm"
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

  <Separator className="my-6" />
        {/* Cover Image above Title (3:1) */}
        {page.cover_image_url && (
          <div className="mb-6 overflow-hidden rounded-lg" style={{ aspectRatio: '3 / 1' }}>
            <img
              src={page.cover_image_url}
              alt={page.title ?? ''}
              className="w-full h-full object-cover"
            />
          </div>
        )}

  <h1 className="text-4xl font-bold mb-2">{page.title}</h1>
        {page.subtitle && (
          <p className="text-xl text-muted-foreground mb-6">{page.subtitle}</p>
        )}

        {/* AdSense Ad Unit */}
        <div className="flex justify-center my-6">
          <ins className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center', minHeight: 90 }}
            data-ad-client="ca-pub-1115531355970011"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
        <script dangerouslySetInnerHTML={{__html: "(window.adsbygoogle = window.adsbygoogle || []).push({});"}} />

        {/* Tags */}
        {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {page.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Cover Image moved above title inside header */}

      {/* Page Content */}
      <div className="prose prose-lg max-w-none mb-8">
        {page.content.blocks?.map((block: any, index: number) => {
          const next = page.content.blocks?.[index + 1];
          const showSeparator =
            index < (page.content.blocks?.length || 0) - 1 &&
            block?.type !== 'spacer' &&
            next?.type !== 'spacer';
          return (
            <div key={index}>
              {renderBlock(block, index)}
              {showSeparator && (
                <div className="my-6">
                  <Separator />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Separator className="my-8" />

      {/* Page Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleLike}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {page.likes_count}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleBookmark}
            className={isBookmarked ? "text-primary" : ""}
          >
            <Bookmark className={`h-5 w-5 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
            {page.bookmarks_count}
          </Button>
        </div>

        <Button variant="ghost" onClick={handleShare}>
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      <CommentSection articleId={page.id} />

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this content</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tell us briefly what's wrong with this page.</p>
            <Textarea
              placeholder="Why are you reporting this content?"
              value={reportReason ?? ''}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={submitReport}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}