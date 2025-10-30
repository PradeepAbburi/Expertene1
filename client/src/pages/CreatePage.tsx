import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Save, Eye, Settings, Share2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { checkAndUpdateStreak } from '@/lib/streak';
import { DraggableBlockEditor, Block } from '@/components/editor/DraggableBlockEditor';
import { useGamification } from '@/hooks/useGamification';
import { ShareDialog } from '@/components/ShareDialog';
import { DraftsDropdown } from '@/components/DraftsDropdown';
import { ImageCropDialog } from '@/components/ImageCropDialog';

export default function CreatePage() {
  const { user } = useAuth();
  const { updateTaskProgress } = useGamification();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showSettings, setShowSettings] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [shareToken, setShareToken] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [pageId, setPageId] = useState<string>('');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default: insert a spacer as the first block for new pages
  useEffect(() => {
    if (!editId && blocks.length === 0) {
      setBlocks([
        {
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'spacer' as Block['type'],
          // reduce initial spacer height so title and first block are closer
          content: { height: 8 },
        },
      ]);
      // editor ready for new page
      setTimeout(() => setInitializing(false), 0);
    }
  }, [editId]);

  // Load existing page for editing
  useEffect(() => {
    if (editId && user) {
      (async () => {
        setInitializing(true);
        await loadPageForEditing(editId);
        setInitializing(false);
      })();
    }
  }, [editId, user]);

  const loadPageForEditing = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, page_collaborators(*)')
        .eq('id', id)
        .eq('author_id', user?.id ?? '')
        .single();

      if (error) throw error;

      setTitle(data.title);
      setSubtitle(data.subtitle || '');
      setCoverImage(data.cover_image_url || '');
      setBlocks((data.content as any)?.blocks || []);
      setTags(data.tags || []);
      setIsPrivate(data.is_private || false);
      setShareToken(data.share_token || '');
      setCollaborators(data.page_collaborators || []);
      setPageId(id);
    } catch (error: any) {
      toast({
        title: "Error loading page",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const fetchCollaborators = async () => {
    if (!pageId) return;
    
    try {
      const { data, error } = await supabase
        .from('page_collaborators')
        .select('*')
        .eq('page_id', pageId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      const fileName = `${user?.id}-${Date.now()}.jpg`;
      const filePath = `banners/${fileName}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);
      setCropDialogOpen(false);
      setImageToCrop('');
      toast({ title: 'Banner uploaded successfully' });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({ title: 'Error uploading banner', variant: 'destructive' });
    }
  };

  const generateSlug = async (title: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-slug', {
        body: { title }
      });
      
      if (error) {
        console.warn('Edge function failed, using fallback slug generation:', error);
        return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || `page-${Date.now()}`;
      }
      
      return data?.slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || `page-${Date.now()}`;
    } catch (error) {
      console.warn('Error generating slug, using fallback:', error);
      return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || `page-${Date.now()}`;
    }
  };

  const calculateReadingTime = (blocks: Block[]) => {
    let wordCount = 0;
    blocks.forEach(block => {
      if (block.type === 'text' && typeof block.content === 'string') {
        wordCount += block.content.trim().split(/\s+/).length;
      }
    });
    return Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
  };

  const handleSubmit = async (publish = false) => {
    if (!user) return;
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your page.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const slug = await generateSlug(title);
      const readingTime = calculateReadingTime(blocks);

      let data;
      if (editId) {
        // Update existing page
        const result = await supabase
          .from('articles')
          .update({
            title,
            subtitle: subtitle || null,
            content: { blocks } as any,
            cover_image_url: coverImage || null,
            tags,
            is_published: publish,
            is_private: isPrivate,
            published_at: publish ? new Date().toISOString() : null,
            slug,
            reading_time: readingTime,
          })
          .eq('id', editId)
          .select()
          .single();

        if (result.error) throw result.error;
        data = result.data;
      } else {
        // Create new page
        const result = await supabase
          .from('articles')
          .insert({
            title,
            subtitle: subtitle || null,
            content: { blocks } as any,
            cover_image_url: coverImage || null,
            tags,
            author_id: user.id,
            is_published: publish,
            is_private: isPrivate,
            published_at: publish ? new Date().toISOString() : null,
            slug,
            reading_time: readingTime,
          })
          .select()
          .single();

        if (result.error) throw result.error;
        data = result.data;
        setPageId(data.id);
      }

      // Track analytics and update gamification
      if (publish) {
        await supabase.functions.invoke('analytics', {
          body: {
            event_type: 'article_published',
            article_id: data.id,
            metadata: { title, tags }
          }
        });

        // Update task progress for publishing
        await updateTaskProgress('publish_article');

        // Update user's streak for publishing an article
        try {
          if (user?.id) {
            const newStreak = await checkAndUpdateStreak(user.id, new Date());
            window.dispatchEvent(new CustomEvent('streak-updated', { detail: { streak: newStreak } }));
          }
        } catch (e) {
          console.error('Failed updating streak on publish:', e);
        }
      }

      toast({
        title: publish ? "Page published!" : "Draft saved!",
        description: publish 
          ? "Your page is now live and visible to readers."
          : "Your page has been saved as a draft.",
      });

      if (!editId) {
        navigate(`/page/${data.id}`);
      }
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

  const contentBlocksCount = blocks.filter(b => b.type !== 'spacer').length;

  return (
    <div className="min-h-screen bg-background">
      {initializing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-t-4 border-t-primary animate-spin" />
            <div className="text-sm text-muted-foreground">Loading editor…</div>
          </div>
        </div>
      )}
      {/* Back button (placed inline in header for previous behavior) */}
      {/* Header - positioned below navbar on desktop, below navbar+searchbar on mobile */}
      <div className="sticky top-28 sm:top-14 z-40 bg-background border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="inline-flex">
                ← Back
              </Button>
              <div className="text-sm text-muted-foreground hidden sm:block">
                {contentBlocksCount > 0 ? `${contentBlocksCount} blocks` : 'New page'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Hidden on mobile: show on >= sm */}
              <div className="hidden sm:flex items-center gap-2">
                <DraftsDropdown />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {pageId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(false)}
                  disabled={loading || !title}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>
              {/* Publish always visible */}
              <Button
                size="sm"
                onClick={() => handleSubmit(true)}
                disabled={loading || !title}
              >
                <Eye className="h-4 w-4 mr-2" />
                {loading ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
          {/* Mobile-only subrow for Drafts + Save Draft */}
          <div className="mt-3 flex items-center gap-2 sm:hidden">
            <DraftsDropdown />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={loading || !title}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

            <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {/* Settings Panel */}
        {( 
          <Card className="mb-8 p-4 sm:p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="cover-image">Cover Banner (3:1 ultra-wide)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="cover-image"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="privacy">Privacy</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="privacy-switch" className="text-sm text-muted-foreground">
                    {isPrivate ? 'Private (only accessible via link)' : 'Public (visible to everyone)'}
                  </Label>
                  <Switch
                    id="privacy-switch"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mt-1 mb-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Cover Image Preview */}
        {coverImage && (
          <div className="mb-8 overflow-hidden rounded-lg" style={{ aspectRatio: '3 / 1' }}>
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title..."
            className="text-4xl font-bold border-none px-0 py-4 h-auto bg-transparent placeholder:text-muted-foreground focus-visible:ring-0"
            style={{ fontSize: '2.25rem', lineHeight: '2.5rem' }}
          />
        </div>

        {/* Description */}
        <div className="mb-8">
          <Textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add a description..."
            className="text-lg border-none px-0 py-2 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 resize-none"
            rows={3}
          />
        </div>

        {/* Block Editor */}
        <div className="mb-8">
          <DraggableBlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          pageId={pageId}
          shareToken={shareToken}
          collaborators={collaborators}
          onShareTokenGenerated={setShareToken}
          onCollaboratorAdded={fetchCollaborators}
        />

        <ImageCropDialog
          open={cropDialogOpen}
          onClose={() => {
            setCropDialogOpen(false);
            setImageToCrop('');
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          aspect={3 / 1}
        />
      </div>
    </div>
  );
}