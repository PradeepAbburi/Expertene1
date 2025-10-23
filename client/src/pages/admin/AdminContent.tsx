import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Download, Search, Eye, ThumbsUp, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  views_count: number;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  profiles: {
    username: string;
    display_name: string;
  };
}

export default function AdminContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await (supabase as any)
        .from('articles')
        .select('*', { count: 'exact', head: true });

      setTotalPages(count || 0);

      // Get pages data
      const { data, error } = await (supabase as any)
        .from('articles')
        .select(`
          id,
          title,
          slug,
          author_id,
          views_count,
          likes_count,
          bookmarks_count,
          comments_count,
          created_at,
          updated_at,
          is_published,
          profiles:author_id (
            username,
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast({
        title: 'Failed to fetch content',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPages();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('articles')
        .select(`
          id,
          title,
          slug,
          author_id,
          views_count,
          likes_count,
          bookmarks_count,
          comments_count,
          created_at,
          updated_at,
          is_published,
          profiles:author_id (
            username,
            display_name
          )
        `)
        .or(`title.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Author', 'Views', 'Likes', 'Bookmarks', 'Comments', 'Published', 'Created', 'Updated'];
    const rows = pages.map((page) => [
      page.title,
      page.profiles.display_name || page.profiles.username,
      page.views_count,
      page.likes_count,
      page.bookmarks_count,
      page.comments_count,
      page.is_published ? 'Yes' : 'No',
      new Date(page.created_at).toLocaleDateString(),
      new Date(page.updated_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Content data downloaded as CSV',
    });
  };

  const exportToJSON = () => {
    const jsonData = pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      author: page.profiles.display_name || page.profiles.username,
      author_id: page.author_id,
      stats: {
        views: page.views_count,
        likes: page.likes_count,
        bookmarks: page.bookmarks_count,
        comments: page.comments_count,
      },
      is_published: page.is_published,
      created_at: page.created_at,
      updated_at: page.updated_at,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Content data downloaded as JSON',
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">Content Management</h1>
          <p className="text-muted-foreground mt-1">View and export platform content data</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pages.reduce((sum, p) => sum + p.views_count, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pages.reduce((sum, p) => sum + p.likes_count, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pages.reduce((sum, p) => sum + p.bookmarks_count, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Content</CardTitle>
              <CardDescription>Search and manage platform pages</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={exportToJSON} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Content List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading content...</p>
            ) : pages.length > 0 ? (
              pages.map((page) => (
                <div
                  key={page.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="font-medium line-clamp-1">{page.title}</h3>
                        {!page.is_published && (
                          <Badge variant="secondary" className="text-xs">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {page.profiles.display_name || page.profiles.username} • {new Date(page.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {page.views_count} views
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {page.likes_count} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {page.bookmarks_count} bookmarks
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/page/${page.slug}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Info Card */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-sm">Content Data API</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To create a backend API endpoint for content data:</p>
          <div className="bg-muted p-3 rounded font-mono text-xs">
            GET /api/admin/content
          </div>
          <p className="mt-2">This endpoint should:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Require admin authentication</li>
            <li>Return paginated content data with metadata</li>
            <li>Support filtering by date range, author, and status</li>
            <li>Include aggregated statistics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
