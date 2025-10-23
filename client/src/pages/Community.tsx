import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Users, MessageCircle, Plus } from 'lucide-react';
import { CreateCommunityPost } from '@/components/CreateCommunityPost';
import { CommunityPostCard } from '@/components/CommunityPostCard';
import { CreatorDashboard } from '@/components/CreatorDashboard';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
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

interface CommunityPost {
  id: string | null | undefined;
  title: string | null | undefined;
  content: any;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string | null | undefined;
  creator_id: string | null | undefined;
  author_id: string | null | undefined;
  profiles: {
    username: string | null | undefined;
    display_name: string | null | undefined;
    avatar_url: string | null | undefined;
  };
  creators: {
    profiles: {
      username: string | null | undefined;
      display_name: string | null | undefined;
    };
  };
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [userCreator, setUserCreator] = useState<Creator | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

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

      // Fetch user subscriptions
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('creator_id')
        .eq('subscriber_id', user?.id)
        .eq('status', 'active');

      if (subscriptionsData) {
        setUserSubscriptions(subscriptionsData.map(s => s.creator_id));
      }

      // Fetch community posts for subscribed creators
      if (subscriptionsData && subscriptionsData.length > 0) {
        const { data: postsData } = await supabase
          .from('community_posts')
          .select(`
            *,
            profiles!community_posts_author_id_fkey (
              username,
              display_name,
              avatar_url
            ),
            creators!community_posts_creator_id_fkey (
              profiles!creators_user_id_fkey (
                username,
                display_name
              )
            )
          `)
          .in('creator_id', subscriptionsData.map(s => s.creator_id))
          .order('created_at', { ascending: false });

        if (postsData) {
          setCommunityPosts(postsData as any);
        }
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

  const handleSubscribe = async (creatorId: string, planType: 'monthly' | 'yearly') => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert([{
          subscriber_id: user?.id,
          creator_id: creatorId,
          plan_type: planType,
          status: 'active'
        }]);

      if (error) throw error;

      setUserSubscriptions([...userSubscriptions, creatorId]);
      toast({
        title: "Subscribed!",
        description: "You're now subscribed to this creator",
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe",
        variant: "destructive",
      });
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
            <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Creator
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          {userCreator && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {userSubscriptions.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Community Feed</h2>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </div>

              {showCreatePost && (
                <CreateCommunityPost
                  userSubscriptions={userSubscriptions}
                  onClose={() => setShowCreatePost(false)}
                  onPostCreated={() => {
                    fetchData();
                    setShowCreatePost(false);
                  }}
                />
              )}

              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    onUpdate={fetchData}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Subscriptions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Subscribe to creators to see their community posts and participate in discussions.
                </p>
                <Button onClick={() => {
                  const creatorsTab = document.querySelector('[value="creators"]') as HTMLButtonElement;
                  creatorsTab?.click();
                }}>
                  Browse Creators
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="creators" className="space-y-6">
          <h2 className="text-xl font-semibold">Verified Creators</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <Card key={creator.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={creator.profiles.avatar_url} />
                        <AvatarFallback>
                          {creator.profiles.display_name?.[0] || creator.profiles.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {creator.profiles.display_name || creator.profiles.username}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          @{creator.profiles.username}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                      <Crown className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
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
                  
                  {!userSubscriptions.includes(creator.user_id) ? (
                    <SubscriptionPlans
                      creator={creator}
                      onSubscribe={handleSubscribe}
                    />
                  ) : (
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Subscribed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsList
            userCreator={userCreator}
            userSubscriptions={userSubscriptions}
          />
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