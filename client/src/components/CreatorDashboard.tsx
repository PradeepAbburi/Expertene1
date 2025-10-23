import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, MessageCircle, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Creator {
  id: string;
  user_id: string;
  is_verified: boolean;
  subscriber_count: number;
  monthly_price: number;
  yearly_price: number;
  description: string;
  perks: string[];
}

interface CreatorDashboardProps {
  creator: Creator;
}

export function CreatorDashboard({ creator }: CreatorDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(creator.description || '');
  const [monthlyPrice, setMonthlyPrice] = useState(creator.monthly_price);
  const [yearlyPrice, setYearlyPrice] = useState(creator.yearly_price);
  const [perks, setPerks] = useState(creator.perks || []);
  const [newPerk, setNewPerk] = useState('');
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    calculateRevenue();
  }, [creator.subscriber_count, creator.monthly_price]);

  const calculateRevenue = () => {
    // Simplified revenue calculation (assuming all monthly subscriptions)
    const monthlyRevenue = creator.subscriber_count * creator.monthly_price;
    setRevenue(monthlyRevenue);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('creators')
        .update({
          description,
          monthly_price: monthlyPrice,
          yearly_price: yearlyPrice,
          perks
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your creator profile has been updated",
      });
      
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPerk = () => {
    if (newPerk.trim()) {
      setPerks([...perks, newPerk.trim()]);
      setNewPerk('');
    }
  };

  const removePerk = (index: number) => {
    setPerks(perks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Creator Dashboard</h2>
        <div className="flex items-center gap-2">
          {creator.is_verified && (
            <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
              Verified Creator
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creator.subscriber_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Settings</CardTitle>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => editing ? setEditing(false) : setEditing(true)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what subscribers get..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Monthly Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Yearly Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subscription Perks</label>
                <div className="space-y-2">
                  {perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 text-sm">{perk}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePerk(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newPerk}
                      onChange={(e) => setNewPerk(e.target.value)}
                      placeholder="Add a new perk..."
                      onKeyPress={(e) => e.key === 'Enter' && addPerk()}
                    />
                    <Button onClick={addPerk} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <p className="text-sm text-muted-foreground">
                  {description || 'No description set'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Monthly Price</label>
                  <p className="text-lg font-semibold">${monthlyPrice}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Yearly Price</label>
                  <p className="text-lg font-semibold">${yearlyPrice}</p>
                </div>
              </div>

              {perks.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Subscription Perks</label>
                  <ul className="space-y-1">
                    {perks.map((perk, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}