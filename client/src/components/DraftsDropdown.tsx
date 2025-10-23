import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Draft {
  id: string | null | undefined;
  title: string | null | undefined;
  updated_at: string | null | undefined;
}

export function DraftsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrafts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, updated_at')
        .eq('author_id', user.id)
        .eq('is_published', false)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const openDraft = (draftId: string) => {
    navigate(`/create?edit=${draftId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Drafts ({drafts.length})
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {loading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : drafts.length === 0 ? (
          <DropdownMenuItem disabled>No drafts found</DropdownMenuItem>
        ) : (
          drafts.map((draft) => (
            <DropdownMenuItem
              key={draft.id}
              onClick={() => openDraft(draft.id)}
              className="flex flex-col items-start gap-1 p-3"
            >
              <span className="font-medium truncate w-full">{draft.title}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(draft.updated_at), 'MMM d, yyyy')}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}