import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Bookmark, MessageCircle, Eye, MoreHorizontal, Pencil, Archive, Trash2, Flag, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { UserLevelBadge } from './UserLevelBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Page {
  id: string;
  title: string;
  subtitle?: string;
  cover_image_url?: string;
  reading_time?: number;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  comments_count: number;
  published_at: string;
  tags: string[];
  profiles: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface PageCardProps {
  page: Page;
  showBookmark?: boolean;
  showOwnerMenu?: boolean; // show kebab menu for owner controls
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PageCard({ page, showBookmark = true, showOwnerMenu = false, onEdit, onArchive, onDelete }: PageCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(page.likes_count);
  const [bookmarksCount, setBookmarksCount] = useState(page.bookmarks_count);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (user) {
      checkUserInteractions();
    }
  }, [user, page.id]);

  const checkUserInteractions = async () => {
    if (!user) return;

    try {
      // Check if user has liked this article
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user!.id)
        .eq('article_id', page.id)
        .single();

      setIsLiked(!!likeData);

      // Check if user has bookmarked this article
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user!.id)
        .eq('article_id', page.id)
        .single();

      setIsBookmarked(!!bookmarkData);
    } catch (error) {
      // Ignore errors for non-existent records
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like pages.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user!.id)
          .eq('article_id', page.id);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user!.id as string, article_id: page.id });
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark pages.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user!.id)
          .eq('article_id', page.id);
        setBookmarksCount(prev => prev - 1);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ user_id: user!.id as string, article_id: page.id });
        setBookmarksCount(prev => prev + 1);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
    }
  };

  const downloadArticleJSON = () => {
    const data = {
      id: page.id,
      title: page.title,
      subtitle: page.subtitle,
      author: page.profiles.display_name || page.profiles.username,
      author_id: page.profiles.user_id,
      tags: page.tags,
      stats: {
        likes: likesCount,
        bookmarks: bookmarksCount,
        views: page.views_count,
        comments: page.comments_count,
      },
      published_at: page.published_at,
      cover_image_url: page.cover_image_url,
      reading_time: page.reading_time,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title.replace(/[^a-z0-9-_]+/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitReport = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please sign in', description: 'You must be signed in to report content', variant: 'destructive' });
      return;
    }
    try {
      await (supabase as any)
        .from('content_reports')
        .insert({
          reported_item_type: 'page',
          reported_item_id: page.id,
          reporter_user_id: user?.id,
          reason: reportReason || 'Inappropriate or spam',
          status: 'pending',
        });
      toast({ title: 'Report submitted', description: 'Our team will review this content shortly.' });
      setReportOpen(false);
      setReportReason('');
    } catch (e: any) {
      toast({ title: 'Failed to submit report', description: e.message, variant: 'destructive' });
    }
  };

  const OwnerMenu = ({ onEdit, onArchive, onDelete }: { onEdit?: () => void; onArchive?: () => void; onDelete?: () => void }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive} className="gap-2">
          <Archive className="h-4 w-4" /> Archive
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setReportOpen(true)} className="gap-2">
          <Flag className="h-4 w-4 text-amber-600" /> Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadArticleJSON} className="gap-2">
          <Download className="h-4 w-4" /> Download JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-smooth">
      {page.cover_image_url && (
        <div className="overflow-hidden" style={{ height: '9rem' }}>
          <img
            src={page.cover_image_url}
            alt={page.title}
            className="w-full h-full object-cover hover:scale-105 transition-smooth"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={page.profiles.avatar_url} />
            <AvatarFallback>
              {page.profiles.display_name?.charAt(0) || page.profiles.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {page.profiles.display_name || page.profiles.username}
              </p>
              <UserLevelBadge userId={page.profiles.user_id} />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(page.published_at))} ago
              {page.reading_time && ` · ${page.reading_time} min read`}
            </p>
          </div>
          {showOwnerMenu && (
            <OwnerMenu
              onEdit={() => onEdit?.(page.id)}
              onArchive={() => onArchive?.(page.id)}
              onDelete={() => onDelete?.(page.id)}
            />
          )}
        </div>
        
        <Link to={`/page/${page.id}${location.pathname === '/archive' ? '?from=archive' : ''}`} className="group">
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {page.title}
          </h3>
          {page.subtitle && (
            <p className="text-muted-foreground line-clamp-2 mt-1">
              {page.subtitle}
            </p>
          )}
        </Link>
      </CardHeader>
      
      <CardContent className="pt-0">
        {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {page.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{page.views_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{page.comments_count || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            
            {showBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "text-primary" : ""}
              >
                <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-current" : ""}`} />
                {bookmarksCount}
              </Button>
            )}
          </div>
        </div>
      </CardContent>

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
              value={reportReason}
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
    </Card>
  );
}