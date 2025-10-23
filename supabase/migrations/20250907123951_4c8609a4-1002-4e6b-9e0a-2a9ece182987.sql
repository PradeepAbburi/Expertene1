-- Create creators table to track creator status
CREATE TABLE public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  subscriber_count INTEGER DEFAULT 0,
  monthly_price DECIMAL(10,2) DEFAULT 9.99,
  yearly_price DECIMAL(10,2) DEFAULT 99.99,
  description TEXT,
  perks TEXT[]
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(user_id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')) DEFAULT 'monthly',
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subscriber_id, creator_id)
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(user_id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create room members table
CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'moderator')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create room messages table
CREATE TABLE public.room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators
CREATE POLICY "Creators are viewable by everyone" ON public.creators
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own creator profile" ON public.creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile" ON public.creators
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() IN (SELECT user_id FROM public.creators WHERE user_id = creator_id));

CREATE POLICY "Users can create subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = subscriber_id);

-- RLS Policies for community posts
CREATE POLICY "Community posts are viewable by subscribers" ON public.community_posts
  FOR SELECT USING (
    auth.uid() = creator_id OR 
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE subscriber_id = auth.uid() 
      AND creator_id = community_posts.creator_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Subscribers can create community posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND (
      auth.uid() = creator_id OR
      EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE subscriber_id = auth.uid() 
        AND creator_id = community_posts.creator_id 
        AND status = 'active'
      )
    )
  );

CREATE POLICY "Authors can update their own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = creator_id);

-- RLS Policies for rooms
CREATE POLICY "Rooms are viewable by members and creator" ON public.rooms
  FOR SELECT USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.room_members 
      WHERE room_id = rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage their rooms" ON public.rooms
  FOR ALL USING (auth.uid() = creator_id);

-- RLS Policies for room members
CREATE POLICY "Room members are viewable by room members" ON public.room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE id = room_members.room_id 
      AND (creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.room_members rm 
        WHERE rm.room_id = rooms.id AND rm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Room creators can manage members" ON public.room_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE id = room_members.room_id AND creator_id = auth.uid()
    )
  );

-- RLS Policies for room messages
CREATE POLICY "Room messages are viewable by room members" ON public.room_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_members 
      WHERE room_id = room_messages.room_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE id = room_messages.room_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Room members can send messages" ON public.room_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM public.room_members 
        WHERE room_id = room_messages.room_id AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE id = room_messages.room_id AND creator_id = auth.uid()
      )
    )
  );

-- Function to update creator status based on followers
CREATE OR REPLACE FUNCTION update_creator_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update creator verification status if they have 5+ followers
  INSERT INTO public.creators (user_id, is_verified, subscriber_count)
  SELECT 
    p.user_id,
    CASE WHEN p.followers_count >= 5 THEN true ELSE false END,
    p.followers_count
  FROM public.profiles p
  WHERE p.user_id = COALESCE(NEW.following_id, OLD.following_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_verified = CASE WHEN EXCLUDED.subscriber_count >= 5 THEN true ELSE false END,
    subscriber_count = EXCLUDED.subscriber_count,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update creator status on follow changes
CREATE TRIGGER update_creator_status_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_status();

-- Function to update subscription counts
CREATE OR REPLACE FUNCTION update_subscription_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.creators 
    SET subscriber_count = subscriber_count + 1 
    WHERE user_id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.creators 
    SET subscriber_count = subscriber_count - 1 
    WHERE user_id = OLD.creator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for subscription count updates
CREATE TRIGGER update_subscription_counts_trigger
  AFTER INSERT OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_counts();