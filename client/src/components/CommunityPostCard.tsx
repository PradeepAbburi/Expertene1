import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface CommunityPostCardProps {
  post: {
    id: string | null | undefined;
    title: string | null | undefined;
    content: any;
    is_pinned: boolean;
    likes_count: number;
    comments_count: number;
    created_at: string | null | undefined;
    creator_id: string | null | undefined;
    author_id: string | null | undefined;
    profiles: {
      username: string | null | undefined;
      display_name: string | null | undefined;
      avatar_url: string | null | undefined;
    } | null;
    creators: {
      profiles: {
        username: string | null | undefined;
        display_name: string | null | undefined;
      };
    } | null;
  };
  onUpdate: () => void;
}

export function CommunityPostCard({ post, onUpdate }: CommunityPostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', post.id)
          .eq('user_id', user?.id ?? '');

        if (error) throw error;
        
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([{
            article_id: post.id,
            user_id: user?.id
          }]);

        if (error) throw error;
        
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const authorProfile = post.profiles;
  const creatorProfile = post.creators?.profiles;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={authorProfile?.avatar_url} />
              <AvatarFallback>
                {authorProfile?.display_name?.[0] || authorProfile?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {authorProfile?.display_name || authorProfile?.username || 'Unknown User'}
                </span>
                {post.is_pinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                in @{creatorProfile?.username || 'Unknown Creator'} community • {' '}
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <div className="prose prose-sm max-w-none">
            {typeof post.content === 'object' && post.content?.text ? (
              <p>{post.content.text}</p>
            ) : (
              <p>{String(post.content)}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 ${liked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {post.comments_count}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}