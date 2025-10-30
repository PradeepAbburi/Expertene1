import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserLevelBadgeProps {
  userId: string | null | undefined;
  className?: string | null | undefined;
}

export function UserLevelBadge({ userId, className = "" }: UserLevelBadgeProps) {
  const [level, setLevel] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLevel();
  }, [userId]);

  const fetchUserLevel = async () => {
    try {
      const { data } = await supabase
        .from('user_levels')
        .select('level')
        .eq('user_id', userId ?? '')
        .single();
      
      setLevel(data?.level || 1);
    } catch (error) {
      // User might not have a level yet, default to 1
      setLevel(1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Badge 
      variant="secondary" 
      className={`text-xs font-medium bg-gradient-primary text-primary-foreground ${className}`}
    >
      <Trophy className="h-3 w-3 mr-1" />
      Level {level}
    </Badge>
  );
}