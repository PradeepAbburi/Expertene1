import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  user_id: string | null | undefined;
  username: string | null | undefined;
  display_name?: string | null | undefined;
  avatar_url?: string | null | undefined;
  bio?: string | null | undefined;
  followers_count?: number;
  following_count?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, followers_count, following_count')
        .eq('user_id', userId)
        .single();
      
  setProfile(data as unknown as UserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    try {
      // remove any local auth token we may have stored
      localStorage.removeItem('auth_token');
    } catch (e) {
      // ignore
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!user
  };
}