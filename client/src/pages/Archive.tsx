import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PageCard } from '@/components/PageCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArchiveRestore, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
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

interface Page {
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

export default function Archive() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchArchivedPages();
    }
  }, [user]);

  const fetchArchivedPages = async () => {
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
        .eq('author_id', user?.id)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching archived pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_archived: false })
        .eq('id', pageId);

      if (error) throw error;

      toast({ title: 'Page unarchived successfully' });
      await fetchArchivedPages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unarchive page',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: 'Page deleted successfully' });
      setDeleteId(null);
      await fetchArchivedPages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (pages.length === 0) { 
    return ( 
      <div className="text-center py-12"> 
        <div className="mb-6"><BackButton /></div> 
        <h2 className="text-2xl font-bold mb-2">No archived pages</h2> 
        <p className="text-muted-foreground"> 
          Pages you archive will appear here 
        </p> 
      </div> 
    ); 
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Archived Pages</h1>
      
      <div className="grid gap-6">
        {pages.map((page) => (
          <div key={page.id} className="relative group">
            <PageCard page={page} />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUnarchive(page.id)}
              >
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Unarchive
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteId(page.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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
    </div>
  );
}
