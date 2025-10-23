import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, DollarSign, CreditCard, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: string | null | undefined;
  user_id: string | null;
  amount: number;
  currency: string | null | undefined;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'canceled';
  provider: string | null;
  provider_payment_id: string | null;
  description: string | null;
  created_at: string | null | undefined;
  profiles?: {
    username: string | null | undefined;
    display_name: string | null | undefined;
  } | null;
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tableMissing, setTableMissing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('payments')
        .select(`
          id, user_id, amount, currency, status, provider, provider_payment_id, description, created_at,
          profiles:user_id (username, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        if ((error as any).code === '42P01') setTableMissing(true);
        throw error;
      }

      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = useMemo(() =>
    payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [payments]
  );

  const exportCSV = () => {
    const headers = ['Date','User','Amount','Currency','Status','Provider','Provider ID','Description'];
    const rows = payments.map(p => [
      new Date(p.created_at).toISOString(),
      p.profiles?.display_name || p.profiles?.username || '-',
      (Number(p.amount) || 0).toFixed(2),
      p.currency,
      p.status,
      p.provider || '-',
      p.provider_payment_id || '-',
      (p.description || '').replace(/"/g, '""'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported payments CSV' });
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return payments;
    const q = query.toLowerCase();
    return payments.filter(p =>
      (p.profiles?.display_name || p.profiles?.username || '').toLowerCase().includes(q) ||
      (p.provider || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.provider_payment_id || '').toLowerCase().includes(q)
    );
  }, [query, payments]);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 px-4">
      {tableMissing && (
        <div className="border border-yellow-400/30 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
          <p className="font-medium">Payments table not found</p>
          <p className="text-sm mt-1">Apply the migration at supabase/migrations/20251018121000_create_payments_table.sql, then reload this page.</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">Payments</h1>
          <p className="text-muted-foreground mt-1">View revenue and payment history</p>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <p className="text-2xl font-bold">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Succeeded Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payments.filter(p => p.status === 'succeeded').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Filter and export payments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input placeholder="Search by user, provider, status, id, description..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading payments...</p>
            ) : filtered.length > 0 ? (
              filtered.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <p className="font-medium">{(Number(p.amount) || 0).toFixed(2)} {p.currency}</p>
                        <Badge variant={p.status === 'succeeded' ? 'default' : 'secondary'} className="text-xs capitalize">{p.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {p.profiles?.display_name || p.profiles?.username || '-'} • {new Date(p.created_at).toLocaleString()}
                      </p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{p.provider || '-'}</div>
                      <div className="mt-1">{p.provider_payment_id || '-'}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
