import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Mail, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string | null | undefined;
  shareToken?: string | null | undefined;
  collaborators: Array<{
    id: string | null | undefined;
    user_email: string | null | undefined;
    permission: string | null | undefined;
  }>;
  onShareTokenGenerated: (token: string) => void;
  onCollaboratorAdded: () => void;
}

export function ShareDialog({ 
  open, 
  onOpenChange, 
  pageId, 
  shareToken, 
  collaborators,
  onShareTokenGenerated,
  onCollaboratorAdded 
}: ShareDialogProps) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [loading, setLoading] = useState(false);

  const generateShareLink = async () => {
    if (shareToken) return;
    
    setLoading(true);
    try {
      const { data: tokenData } = await supabase.rpc('generate_share_token');
      const { data, error } = await supabase
        .from('articles')
        .update({ share_token: tokenData })
        .eq('id', pageId)
        .select('share_token')
        .single();

      if (error) throw error;
      onShareTokenGenerated(data.share_token);
      
      toast({
        title: "Share link generated!",
        description: "Anyone with this link can access your page.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Share link has been copied.",
    });
  };

  const addCollaborator = async () => {
    if (!newEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('page_collaborators')
        .insert({
          page_id: pageId,
          user_email: newEmail.trim(),
          permission,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setNewEmail('');
      onCollaboratorAdded();
      
      toast({
        title: "Collaborator added!",
        description: `${newEmail} has been invited to ${permission} this page.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('page_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      onCollaboratorAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const shareUrl = shareToken 
    ? `${window.location.origin}/page/${pageId}?token=${shareToken}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Page</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Share Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            {shareToken ? (
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard(shareUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={generateShareLink} 
                disabled={loading}
                className="w-full"
              >
                Generate Share Link
              </Button>
            )}
          </div>

          {/* Add Collaborator */}
          <div className="space-y-2">
            <Label>Invite Collaborators</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={permission} onValueChange={(value: any) => setPermission(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={addCollaborator} 
                disabled={loading || !newEmail.trim()}
                size="sm"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current Collaborators */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <Label>Current Collaborators</Label>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{collaborator.user_email}</span>
                      <Badge variant="secondary" className="text-xs">
                        {collaborator.permission}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCollaborator(collaborator.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}