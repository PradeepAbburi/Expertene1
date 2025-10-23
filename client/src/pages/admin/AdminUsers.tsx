import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Ban, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserSearchResult {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_blocked: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
        const { data, error } = await (supabase as any)
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_blocked, created_at, followers_count, following_count')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleBlockToggle = async (userId: string, currentlyBlocked: boolean) => {
    try {
        const { error } = await (supabase as any)
        .from('profiles')
        .update({ is_blocked: !currentlyBlocked })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: currentlyBlocked ? 'User unblocked' : 'User blocked',
        description: 'Profile updated successfully.',
      });

      handleSearch();
    } catch (error: any) {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">User Management</h1>
          <p className="text-muted-foreground mt-1">Search and manage user accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Find users by username or display name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.display_name?.charAt(0) || user.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.display_name || user.username}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{user.followers_count} followers</span>
                        <span>{user.following_count} following</span>
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={user.is_blocked ? 'outline' : 'destructive'}
                    onClick={() => handleBlockToggle(user.user_id, user.is_blocked)}
                  >
                    {user.is_blocked ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="h-3 w-3 mr-1" />
                        Block
                      </>
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {searching ? 'Searching...' : searchQuery ? 'No users found' : 'Enter a search query to find users'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
