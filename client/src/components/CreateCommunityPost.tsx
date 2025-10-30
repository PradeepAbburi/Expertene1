import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { checkAndUpdateStreak } from '@/lib/streak';

interface CreateCommunityPostProps {
  userSubscriptions: string[];
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreateCommunityPost({ userSubscriptions, onClose, onPostCreated }: CreateCommunityPostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [loading, setLoading] = useState(false);
  // Minimum visible loading time (ms). In development default to 1500ms so skeleton is visible.
  const MIN_LOADING_MS = Number((import.meta as any).env?.VITE_MIN_LOADING_MS ?? ((import.meta as any).env?.DEV ? 1500 : 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedCreator) return;

  const start = Date.now();
  setLoading(true);
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          title: title.trim(),
          content: { text: content.trim() },
          creator_id: selectedCreator,
          author_id: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your community post has been published",
      });
      
      // Update streak for author
      try {
        if (user?.id) {
          const newStreak = await checkAndUpdateStreak(user.id, new Date());
          if (newStreak === null || newStreak === undefined) {
            toast({
              title: "Streak update failed",
              description: "Could not update your streak. Please check console for details.",
              variant: "destructive",
            });
            console.error('Streak update failed for user', user.id);
          } else {
            window.dispatchEvent(new CustomEvent('streak-updated', { detail: { streak: newStreak } }));
          }
        }
      } catch (e) {
        toast({
          title: "Streak update error",
          description: String(e),
          variant: "destructive",
        });
        console.error('Failed to update streak after post:', e);
      }

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      // ensure minimum visible loading time so skeleton/loading animation is noticeable
      try {
        const elapsed = Date.now() - start;
        if (MIN_LOADING_MS > elapsed) {
          await new Promise((res) => setTimeout(res, MIN_LOADING_MS - elapsed));
        }
      } catch (e) {
        // ignore
      }
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Community Post</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="creator" className="text-sm font-medium mb-2 block">
              Post to Creator Community
            </label>
            <Select value={selectedCreator} onValueChange={setSelectedCreator}>
              <SelectTrigger>
                <SelectValue placeholder="Select a creator community" />
              </SelectTrigger>
              <SelectContent>
                {userSubscriptions.map((creatorId) => (
                  <SelectItem key={creatorId} value={creatorId}>
                    Creator {creatorId.slice(0, 8)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="title" className="text-sm font-medium mb-2 block">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="text-sm font-medium mb-2 block">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim() || !selectedCreator}>
              {loading ? (
                <span className="flex items-center">
                  <LoadingSpinner className="mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}