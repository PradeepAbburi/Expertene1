import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Video as VideoIcon, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface VideoContent {
  url: string | null | undefined;
  caption: string | null | undefined;
}

interface VideoBlockProps {
  content: VideoContent;
  onChange: (content: VideoContent) => void;
  onDelete: () => void;
}

export function VideoBlock({ content, onChange, onDelete }: VideoBlockProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const progressTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((p) => (p < 90 ? p + 1 : 90));
    }, 200);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onChange({
        ...content,
        url: data.publicUrl
      });

      setProgress(100);
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      toast({
        title: "Success!",
        description: "Video uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to upload video.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleUrlChange = (url: string) => {
    onChange({ ...content, url });
  };

  const handleCaptionChange = (caption: string) => {
    onChange({ ...content, caption });
  };

  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const isValidVideoUrl = (url: string) => {
    const validExtensions = ['.mp4', '.webm', '.ogg'];
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') || 
           validExtensions.some(ext => url.endsWith(ext));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <VideoIcon className="h-4 w-4" />
          Video Block
        </h4>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="video-url">Video URL</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="video-url"
              value={content.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="YouTube, Vimeo, or direct video URL"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? `Uploading ${progress}%` : 'Browse'}
            </Button>
          </div>
          {uploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Supports YouTube, Vimeo, and direct video files (.mp4, .webm, .ogg)
          </p>
        </div>

        {content.url && isValidVideoUrl(content.url) && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {content.url.includes('youtube.com') || content.url.includes('youtu.be') || content.url.includes('vimeo.com') ? (
                <iframe
                  src={getEmbedUrl(content.url)}
                  className="w-full h-full"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : (
                <video
                  src={content.url}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {content.url && !isValidVideoUrl(content.url) && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <VideoIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Please enter a valid video URL (YouTube, Vimeo, or direct video link)
              </p>
            </CardContent>
          </Card>
        )}

        <div>
          <Label htmlFor="video-caption">Caption (Optional)</Label>
          <Textarea
            id="video-caption"
            value={content.caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption for the video"
            rows={2}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
    </div>
  );
}