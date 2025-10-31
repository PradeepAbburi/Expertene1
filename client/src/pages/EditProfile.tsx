import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/BackButton';
import { Camera, Save } from 'lucide-react';

interface ProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
  location?: string;
}

export default function EditProfile() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setProfile({
        username: data.username ?? undefined,
        display_name: data.display_name ?? undefined,
        bio: data.bio ?? undefined,
        avatar_url: data.avatar_url ?? undefined,
        website_url: data.website_url ?? undefined,
        location: data.location ?? undefined,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          website_url: profile.website_url,
          location: profile.location,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
      
      // Refresh profile in auth context
      refreshProfile();
  navigate(`/profile/${profile.username ?? ''}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // show preview and open crop modal
    const url = URL.createObjectURL(file);
    setSelectedAvatar(file);
    setAvatarPreview(url);
    setShowCropModal(true);
  };

  const cropAndUpload = async () => {
    if (!selectedAvatar || !user) return;
    try {
      // load image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = avatarPreview || URL.createObjectURL(selectedAvatar);
      });

      // crop center square
      const size = Math.min(img.width, img.height);
      const sx = Math.floor((img.width - size) / 2);
      const sy = Math.floor((img.height - size) / 2);

      const canvas = document.createElement('canvas');
      const TARGET = 512; // target size
      canvas.width = TARGET;
      canvas.height = TARGET;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(img, sx, sy, size, size, 0, 0, TARGET, TARGET);

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) throw new Error('Failed to create image blob');

      const fileExt = 'png';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // upload to Supabase storage (allow public read on bucket)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: 'image/png' });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;

      // update profiles table immediately
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      refreshProfile();
      setShowCropModal(false);
      setSelectedAvatar(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }

      toast({ title: 'Success!', description: 'Avatar updated.' });
    } catch (err: any) {
      toast({ title: 'Upload error', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const cancelCrop = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setShowCropModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <BackButton />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
            Edit Profile
          </CardTitle>
          <CardDescription>
            Update your profile information and preferences.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {profile.display_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the camera button to browse and upload a new avatar
              </p>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-background rounded-lg p-6 w-[90vw] max-w-lg">
                  <h3 className="text-lg font-semibold mb-4">Crop avatar</h3>
                  <div className="flex items-center justify-center">
                    <div className="h-64 w-64 rounded-full overflow-hidden border">
                      {avatarPreview && (
                        <img src={avatarPreview} alt="preview" className="object-cover w-full h-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">We will crop the image to a circle. Click "Crop & Upload" to continue.</p>
                  <div className="flex gap-3 justify-end mt-4">
                    <Button variant="outline" onClick={cancelCrop}>Cancel</Button>
                    <Button onClick={cropAndUpload}>Crop & Upload</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username ?? ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Your unique username"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profile.display_name ?? ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Your display name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio ?? ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={profile.website_url ?? ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://your-website.com"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location ?? ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/profile/${profile.username}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}