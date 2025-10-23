import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Edit2, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [permissionsMissing, setPermissionsMissing] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // 42P01 = undefined_table
        const msg = String(error.message || '').toLowerCase();
        if (
          (error as any).code === '42P01' ||
          (error as any).code === 'PGRST205' ||
          msg.includes("could not find the table 'public.announcements'") ||
          (msg.includes('relation') && msg.includes('announcements')) ||
          msg.includes('schema cache')
        ) {
          setTableMissing(true);
        }
        if ((error as any).code === '42501' || String(error.message).toLowerCase().includes('permission denied')) {
          setPermissionsMissing(true);
        }
        throw error;
      }
      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Validation error',
        description: 'Title and message are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('announcements')
        .insert({ title, message, is_active: true });

      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if (
          (error as any).code === '42P01' ||
          (error as any).code === 'PGRST205' ||
          msg.includes("could not find the table 'public.announcements'") ||
          (msg.includes('relation') && msg.includes('announcements')) ||
          msg.includes('schema cache')
        ) {
          setTableMissing(true);
        }
        if ((error as any).code === '42501' || String(error.message).toLowerCase().includes('permission denied')) {
          setPermissionsMissing(true);
        }
        throw error;
      }

      toast({
        title: 'Announcement created',
        description: 'Successfully published site announcement',
      });

      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: 'Failed to create announcement',
        description: error?.message || 'Please ensure the announcements table exists and you have permission.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !title.trim() || !message.trim()) return;

    try {
      const { error } = await (supabase as any)
        .from('announcements')
        .update({ title, message })
        .eq('id', editingId);

      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if ((error as any).code === '42501' || String(error.message).toLowerCase().includes('permission denied')) {
          setPermissionsMissing(true);
        }
        if (
          (error as any).code === '42P01' ||
          (error as any).code === 'PGRST205' ||
          msg.includes("could not find the table 'public.announcements'") ||
          (msg.includes('relation') && msg.includes('announcements')) ||
          msg.includes('schema cache')
        ) {
          setTableMissing(true);
        }
        throw error;
      }

      toast({
        title: 'Announcement updated',
        description: 'Changes saved successfully',
      });

      setTitle('');
      setMessage('');
      setEditingId(null);
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: 'Failed to update',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await (supabase as any)
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if ((error as any).code === '42501' || String(error.message).toLowerCase().includes('permission denied')) {
          setPermissionsMissing(true);
        }
        if (
          (error as any).code === '42P01' ||
          (error as any).code === 'PGRST205' ||
          msg.includes("could not find the table 'public.announcements'") ||
          (msg.includes('relation') && msg.includes('announcements')) ||
          msg.includes('schema cache')
        ) {
          setTableMissing(true);
        }
        throw error;
      }

      toast({
        title: 'Announcement deleted',
        description: 'Successfully removed',
      });

      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('announcements')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if ((error as any).code === '42501' || String(error.message).toLowerCase().includes('permission denied')) {
          setPermissionsMissing(true);
        }
        if (
          (error as any).code === '42P01' ||
          (error as any).code === 'PGRST205' ||
          msg.includes("could not find the table 'public.announcements'") ||
          (msg.includes('relation') && msg.includes('announcements')) ||
          msg.includes('schema cache')
        ) {
          setTableMissing(true);
        }
        throw error;
      }

      toast({
        title: currentActive ? 'Announcement hidden' : 'Announcement activated',
      });

      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: 'Failed to update',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEdit = (announcement: Announcement) => {
    setTitle(announcement.title);
    setMessage(announcement.message);
    setEditingId(announcement.id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 px-4">
      {(tableMissing || permissionsMissing) && (
        <div className="border border-yellow-400/30 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
          <p className="font-medium">{tableMissing ? 'Announcements table not found' : 'Announcements permissions missing'}</p>
          <p className="text-sm mt-1">
            {tableMissing ? (
              <>
                Apply the migration at <span className="font-mono">supabase/migrations/20250108000000_create_announcements_table.sql</span> in your Supabase project (SQL Editor or CLI), then reload this page.
              </>
            ) : (
              <>
                It looks like the Supabase role used by the client does not have INSERT/UPDATE/DELETE permissions. Apply <span className="font-mono">supabase/migrations/20251019000000_fix_announcements_permissions.sql</span> in your Supabase project, then retry.
              </>
            )}
          </p>
        </div>
      )}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">Site Announcements</h1>
          <p className="text-muted-foreground mt-1">Create and manage platform-wide announcements</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={fetchAnnouncements}>Recheck</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create/Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update the existing announcement' : 'Broadcast a message to all users'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Announcement title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Announcement message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={editingId ? handleUpdate : handleCreate} className="flex-1">
                {editingId ? (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setMessage('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Announcements</CardTitle>
            <CardDescription>Manage existing announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{announcement.title}</h3>
                          <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                            {announcement.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{announcement.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(announcement.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(announcement)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                      >
                        {announcement.is_active ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No announcements yet</p>
                  <p className="text-xs mt-2">Create your first announcement to notify users</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
