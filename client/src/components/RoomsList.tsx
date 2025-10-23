import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Plus, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Room {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  max_members: number;
  current_members: number;
  created_at: string;
  creator_id: string;
  creators: {
    profiles: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

interface Creator {
  user_id: string;
  is_verified: boolean;
}

interface RoomsListProps {
  userCreator: Creator | null;
  userSubscriptions: string[];
}

export function RoomsList({ userCreator, userSubscriptions }: RoomsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState(50);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [userSubscriptions]);

  const fetchRooms = async () => {
    try {
      // Fetch rooms for subscribed creators or user's own rooms
      const creatorIds = userCreator ? [...userSubscriptions, userCreator.user_id] : userSubscriptions;
      
      if (creatorIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          creators!rooms_creator_id_fkey (
            profiles!creators_user_id_fkey (
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .in('creator_id', creatorIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms((data || []) as any);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!userCreator || !roomName.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .insert([{
          name: roomName.trim(),
          description: roomDescription.trim(),
          is_private: isPrivate,
          max_members: maxMembers,
          creator_id: userCreator.user_id
        }]);

      if (error) throw error;

      toast({
        title: "Room created!",
        description: "Your new room is ready for members",
      });

      setShowCreateForm(false);
      setRoomName('');
      setRoomDescription('');
      setIsPrivate(false);
      setMaxMembers(50);
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('room_members')
        .insert([{
          room_id: roomId,
          user_id: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Joined room!",
        description: "You can now participate in this room",
      });

      fetchRooms();
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Creator Rooms</h2>
        {userCreator && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Room Name</label>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                placeholder="Describe what this room is for..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Max Members</label>
                <Input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                  min={1}
                  max={500}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <label htmlFor="private" className="text-sm font-medium">
                  Private Room
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={createRoom}
                disabled={creating || !roomName.trim()}
              >
                {creating ? 'Creating...' : 'Create Room'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Rooms Available</h3>
            <p className="text-muted-foreground">
              {userCreator
                ? "Create your first room to connect with your subscribers"
                : "Subscribe to creators to access their exclusive rooms"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {room.name}
                      {room.is_private && <Lock className="h-4 w-4" />}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={room.creators.profiles.avatar_url} />
                        <AvatarFallback>
                          {room.creators.profiles.display_name?.[0] || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        @{room.creators.profiles.username}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {room.current_members}/{room.max_members}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {room.description || 'No description'}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>
                    Created {formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}
                  </span>
                </div>

                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => joinRoom(room.id)}
                  disabled={room.current_members >= room.max_members}
                >
                  {room.current_members >= room.max_members ? 'Room Full' : 'Join Room'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}