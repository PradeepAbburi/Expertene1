import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TextBlock } from '@/components/editor/TextBlock';

interface ImageContent {
  url: string;
  alt: string;
  caption: string;
  width?: number; // Percentage width (25, 50, 75, 100)
  sideTextEnabled?: boolean;
  sideText?: string;
  sidePosition?: 'left' | 'right';
}

interface ImageBlockProps {
  content: ImageContent;
  onChange: (content: ImageContent) => void;
  onDelete: () => void;
}

export function ImageBlock({ content, onChange, onDelete }: ImageBlockProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const progressTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageWidth, setImageWidth] = useState(content.width || 100);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    // Simulate upload progress until completion callback
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((p) => (p < 90 ? p + 2 : 90));
    }, 150);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

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

      // Complete progress to 100% on success
      setProgress(100);
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      toast({
        title: "Success!",
        description: "Image uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange({ ...content, url });
  };

  const handleAltChange = (alt: string) => {
    onChange({ ...content, alt });
  };

  const handleCaptionChange = (caption: string) => {
    onChange({ ...content, caption });
  };

  const handleWidthChange = (value: number[]) => {
    const newWidth = value[0];
    setImageWidth(newWidth);
    onChange({ ...content, width: newWidth });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Image Block
        </h4>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {content.url ? (
        <div className="space-y-4">
          {content.sideTextEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              { (content.sidePosition || 'right') === 'left' ? (
                <>
                  {/* Text first, Image second */}
                  <div className="md:col-span-2 h-full">
                    <TextBlock
                      content={content.sideText || ''}
                      onChange={(val) => onChange({ ...content, sideText: val })}
                    />
                  </div>
                  <div className="md:col-span-1 h-full">
                    <div className="relative group mx-auto w-full h-full">
                      <img
                        src={content.url}
                        alt={content.alt}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                        {uploading ? (
                          <div className="w-3/4 bg-background/80 p-3 rounded-md shadow">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span>Uploading…</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Image first, Text second */}
                  <div className="md:col-span-1 h-full">
                    <div className="relative group mx-auto w-full h-full">
                      <img
                        src={content.url}
                        alt={content.alt}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                        {uploading ? (
                          <div className="w-3/4 bg-background/80 p-3 rounded-md shadow">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span>Uploading…</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 h-full">
                    <TextBlock
                      content={content.sideText || ''}
                      onChange={(val) => onChange({ ...content, sideText: val })}
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="block">
              <div className={"relative group mx-auto"} style={{ maxWidth: `${imageWidth}%` }}>
                <img
                  src={content.url}
                  alt={content.alt}
                  className="w-full rounded-lg shadow-sm"
                />
                <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                  {uploading ? (
                    <div className="w-3/4 bg-background/80 p-3 rounded-md shadow">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span>Uploading…</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="width">Image Width: {imageWidth}%</Label>
              <Slider
                id="width"
                min={25}
                max={100}
                step={25}
                value={[imageWidth]}
                onValueChange={handleWidthChange}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="side-text">Add side text (columns)</Label>
              <Switch
                id="side-text"
                checked={!!content.sideTextEnabled}
                onCheckedChange={(v) => onChange({ ...content, sideTextEnabled: v })}
              />
            </div>
            {content.sideTextEnabled && (
              <div className="space-y-2">
                <Label>Side text position</Label>
                <RadioGroup
                  value={content.sidePosition || 'right'}
                  onValueChange={(val) => onChange({ ...content, sidePosition: (val as 'left' | 'right') })}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="pos-left" value="left" />
                    <Label htmlFor="pos-left">Left of image</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="pos-right" value="right" />
                    <Label htmlFor="pos-right">Right of image</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={content.alt}
                onChange={(e) => handleAltChange(e.target.value)}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                value={content.caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="Add a caption for the image"
                rows={2}
              />
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-4 w-full max-w-sm">
              <div>
                <Button
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? `Uploading ${progress}%` : 'Upload Image'}
                </Button>
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span>Uploading…</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">or</div>
              <div>
                <Input
                  placeholder="Paste image URL"
                  value={content.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}