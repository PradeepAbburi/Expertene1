import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Report {
  id: string | null | undefined;
  reported_item_type: string | null | undefined;
  reported_item_id: string | null | undefined;
  reporter_user_id: string | null | undefined;
  reason: string | null | undefined;
  status: string | null | undefined;
  created_at: string | null | undefined;
  reporter: {
    username: string | null | undefined;
    display_name: string | null | undefined;
    avatar_url: string | null | undefined;
  };
}

export default function AdminReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Note: This is a placeholder implementation
      // The reports table needs to be created in Supabase
      const { data, error } = await (supabase as any)
        .from('content_reports')
        .select(`
          id,
          reported_item_type,
          reported_item_id,
          reporter_user_id,
          reason,
          status,
          created_at,
          reporter:reporter_user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // If table doesn't exist, show placeholder message
        console.log('Reports table not yet created:', error);
        setReports([]);
      } else {
        setReports(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string | null | undefined, newStatus: string) => {
    if (!reportId) return;
    try {
      const { error } = await (supabase as any)
        .from('content_reports')
        .update({ status: newStatus })
        .eq('id', reportId as string);

      if (error) throw error;

      toast({
        title: 'Report updated',
        description: `Report marked as ${newStatus}`,
      });

      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Failed to update',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemovePage = async (reportedItemId: string | null | undefined, reportId: string | null | undefined) => {
    if (!reportedItemId || !reportId) return;
    if (!confirm('Permanently remove this page? This action cannot be undone.')) return;
    try {
      // delete the reported article
      const { error } = await (supabase as any)
        .from('articles')
        .delete()
          .eq('id', reportedItemId as string);

      if (error) throw error;

      // mark report resolved
  await (supabase as any).from('content_reports').update({ status: 'resolved' }).eq('id', reportId as string);

      toast({ title: 'Page removed', description: 'The reported page was deleted.' });
      fetchReports();
    } catch (err: any) {
      toast({ title: 'Failed to remove page', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const handleBlockAuthor = async (reportedItemId: string | null | undefined, reportId: string | null | undefined) => {
    if (!reportedItemId || !reportId) return;
    if (!confirm('Block the author of this page? This will prevent the user from accessing the platform.')) return;
    try {
      const { data: pageData, error: fetchError } = await (supabase as any)
        .from('articles')
        .select('id, author_id')
          .eq('id', reportedItemId as string)
        .single();

      if (fetchError) throw fetchError;
      const authorId = pageData?.author_id;
      if (!authorId) throw new Error('Author not found');

      const { error } = await (supabase as any)
        .from('profiles')
        .update({ is_blocked: true })
        .eq('user_id', authorId);

      if (error) throw error;

      // mark report resolved
  await (supabase as any).from('content_reports').update({ status: 'resolved' }).eq('id', reportId as string);

      toast({ title: 'Author blocked', description: 'The author has been blocked from the platform.' });
      fetchReports();
    } catch (err: any) {
      toast({ title: 'Failed to block author', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>;
      default:
        return <Badge>{status ?? 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">Reports & Moderation</h1>
          <p className="text-muted-foreground mt-1">Review and manage user-reported content</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolved
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Dismissed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{filter.charAt(0).toUpperCase() + filter.slice(1)} Reports</CardTitle>
              <CardDescription>
                {filter === 'pending' 
                  ? 'Reports awaiting moderation action'
                  : filter === 'resolved'
                  ? 'Reports that have been actioned'
                  : 'Reports dismissed as invalid'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading reports...</p>
                ) : reports.length > 0 ? (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={report.reporter.avatar_url ?? undefined} />
                            <AvatarFallback>
                              {report.reporter.display_name?.charAt(0) || report.reporter.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              Reported by {report.reporter.display_name || report.reporter.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{report.reporter.username} • {report.created_at ? new Date(report.created_at).toLocaleString() : '—'}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="bg-muted/50 p-3 rounded">
                        <p className="text-sm font-medium mb-1">Report Type: {report.reported_item_type}</p>
                        <p className="text-sm text-muted-foreground">Reason: {report.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Item ID: {report.reported_item_id}
                        </p>
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(report.id as string, 'resolved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(report.id as string, 'dismissed')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePage(report.reported_item_id as string, report.id as string)}
                          >
                            Remove Page
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBlockAuthor(report.reported_item_id as string, report.id as string)}
                          >
                            Block Author
                          </Button>
                          {report.reported_item_type === 'page' && report.reported_item_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/page/${report.reported_item_id as string}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Content
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No {filter} reports</p>
                    {filter === 'pending' && (
                      <>
                        <p className="text-xs mt-2">Reports system is ready for use</p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Note: The content_reports table needs to be created in Supabase
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card about Reports System */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-sm">Reports System Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To enable the reports system, create a <code className="bg-muted px-1 rounded">content_reports</code> table with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>id (uuid, primary key)</li>
            <li>reported_item_type (text) - e.g., 'page', 'comment', 'user'</li>
            <li>reported_item_id (uuid) - ID of the reported content</li>
            <li>reporter_user_id (uuid) - Foreign key to profiles.user_id</li>
            <li>reason (text) - Description of the report</li>
            <li>status (text) - 'pending', 'resolved', or 'dismissed'</li>
            <li>created_at (timestamp with time zone)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
