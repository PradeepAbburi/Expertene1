import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { CreatorDashboard } from '@/components/CreatorDashboard';
import { RoomsList } from '@/components/RoomsList';
import { useToast } from '@/components/ui/use-toast';

interface Creator {
  id: string | null | undefined;
  user_id: string | null | undefined;
  is_verified: boolean;
  subscriber_count: number;
  monthly_price: number;
  yearly_price: number;
  description: string | null | undefined;
  perks: string[];
  profiles: {
    username: string | null | undefined;
    display_name: string | null | undefined;
    avatar_url: string | null | undefined;
    followers_count: number;
  };
}


export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [userCreator, setUserCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch verified creators
      const { data: creatorsData } = await supabase
        .from('creators')
        .select(`
          *,
          profiles!creators_user_id_fkey (
            username,
            display_name,
            avatar_url,
            followers_count
          )
        `)
        .eq('is_verified', true)
        .order('subscriber_count', { ascending: false });

      if (creatorsData) {
        setCreators(creatorsData as any);
      }

      // Check if user is a creator
      const { data: userCreatorData } = await supabase
        .from('creators')
        .select(`
          *,
          profiles!creators_user_id_fkey (
            username,
            display_name,
            avatar_url,
            followers_count
          )
        `)
        .eq('user_id', user?.id ?? '')
        .single();

      if (userCreatorData) {
        setUserCreator(userCreatorData as any);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community</h1>
        
        {userCreator && (
          <div className="flex items-center gap-2">
          </div>
        )}
      </div>

      <Tabs defaultValue="creators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          {userCreator && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
        </TabsList>

        <TabsContent value="creators" className="space-y-6">
          <h2 className="text-xl font-semibold">Verified Creators</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <Card key={creator.id ?? ''} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={creator.profiles.avatar_url ?? ''} />
                        <AvatarFallback>
                          {(creator.profiles.display_name ?? creator.profiles.username ?? 'U')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {creator.profiles.display_name ?? creator.profiles.username ?? 'Unknown'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          @{creator.profiles.username ?? 'unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {creator.profiles.followers_count} followers
                    </div>
                    <div>
                      {creator.subscriber_count} subscribers
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {creator.description && (
                    <p className="text-sm mb-4">{creator.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsList userCreator={userCreator} />
        </TabsContent>

        {userCreator && (
          <TabsContent value="dashboard">
            <CreatorDashboard creator={userCreator} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}