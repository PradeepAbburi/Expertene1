import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, Trophy, AlertTriangle, FileText, Megaphone, DollarSign, Shield, BarChart3 } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [topStreak, setTopStreak] = useState<number>(0);
  const [pendingReports, setPendingReports] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  useEffect(() => {
    const flag = localStorage.getItem('expertene_admin_authed') === 'true';
    if (!flag) {
      navigate('/auth');
    } else {
      setIsAuthed(true);
      fetchDashboardData();
    }
  }, [navigate]);

  // Fetch only pending reports count
  const fetchPendingReports = async () => {
    try {
      const { count: reportsCount } = await (supabase as any)
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPendingReports(reportsCount || 0);
    } catch {
      setPendingReports(0);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setTotalUsers(usersCount || 0);

      // Fetch total pages
        const { count: pagesCount } = await (supabase as any)
          .from('articles')
        .select('*', { count: 'exact', head: true });
      setTotalPages(pagesCount || 0);

      // Fetch top streak
      const { data: topStreakData } = await (supabase as any)
        .from('user_streaks')
        .select('current_streak')
        .order('current_streak', { ascending: false })
        .limit(1)
        .single();
      setTopStreak(topStreakData?.current_streak || 0);

      // Fetch pending reports count (if table exists)
      await fetchPendingReports();

      // Fetch active announcements count - removed as not displayed

      // Fetch total revenue from payments (sum of succeeded)
      try {
        const { data: revenueRows, error: revErr } = await (supabase as any)
          .from('payments')
          .select('amount, status');
        if (revErr) throw revErr;
        const total = (revenueRows || [])
          .filter((r: any) => r.status === 'succeeded')
          .reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);
        setTotalRevenue(total);
      } catch {
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('expertene_admin_authed');
    navigate('/auth');
  };

  // Realtime updates for content_reports to keep pendingReports fresh
  useEffect(() => {
    const channel = (supabase as any)
      .channel('content_reports-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_reports' },
        () => {
          fetchPendingReports();
        }
      )
      .subscribe();

    return () => {
      try { (supabase as any).removeChannel(channel); } catch {}
    };
  }, []);

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 px-4">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-6 md:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Control Center</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Monitor key metrics, manage users and content, and keep your community healthy from one place.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/reports')} className="gap-2"><Shield className="h-4 w-4" /> View Reports</Button>
            <Button onClick={() => navigate('/admin/announcements')} className="gap-2"><Megaphone className="h-4 w-4" /> New Announcement</Button>
            <Button variant="destructive" onClick={handleLogout}>Log out</Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Uploaded content</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">Current highest streak</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending moderation</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Succeeded payments only</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary transition-smooth" onClick={() => navigate('/admin/users')}>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <CardTitle className="text-sm">User Management</CardTitle>
              <CardDescription>Search and manage accounts</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-smooth" onClick={() => navigate('/admin/content')}>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <CardTitle className="text-sm">Content</CardTitle>
              <CardDescription>Review and export pages</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-smooth" onClick={() => navigate('/admin/reports')}>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2"><Shield className="h-5 w-5 text-primary" /></div>
            <div>
              <CardTitle className="text-sm">Moderation</CardTitle>
              <CardDescription>Handle user reports</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-smooth" onClick={() => navigate('/admin/payments')}>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2"><BarChart3 className="h-5 w-5 text-primary" /></div>
            <div>
              <CardTitle className="text-sm">Payments</CardTitle>
              <CardDescription>Revenue and history</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Removed duplicate Management Sections to avoid redundancy */}
    </div>
  );
}
