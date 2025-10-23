import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserLevel {
  level: number;
  experience_points: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  target_value: number;
  reward_experience: number;
  current_progress?: number;
  is_completed?: boolean;
}

export function useGamification() {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState<UserLevel>({ level: 1, experience_points: 0 });
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;

    try {
      // Fetch user level
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('level, experience_points')
        .eq('user_id', user.id)
        .single();

      if (levelData) {
        setUserLevel(levelData);
      }

      // Fetch earned badges
      const { data: badgeData } = await supabase
        .from('user_badges')
        .select(`
          badges (
            id, name, description, icon, requirement_type, requirement_value
          )
        `)
        .eq('user_id', user.id);

      if (badgeData) {
        setEarnedBadges(badgeData.map(item => item.badges).filter(Boolean) as Badge[]);
      }

      // Fetch active tasks with progress
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true);

      if (tasksData) {
        // Get user progress for these tasks
        const { data: progressData } = await supabase
          .from('user_tasks')
          .select('task_id, current_progress, is_completed')
          .eq('user_id', user.id);

        const tasksWithProgress = tasksData.map(task => {
          const progress = progressData?.find(p => p.task_id === task.id);
          return {
            ...task,
            current_progress: progress?.current_progress || 0,
            is_completed: progress?.is_completed || false
          };
        });

        setAvailableTasks(tasksWithProgress);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to level changes
    const levelChannel = supabase
      .channel('user-level-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_levels',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setUserLevel(payload.new as UserLevel);
          }
        }
      )
      .subscribe();

    // Subscribe to badge changes
    const badgeChannel = supabase
      .channel('user-badge-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchGamificationData(); // Refetch to get new badge details
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(levelChannel);
      supabase.removeChannel(badgeChannel);
    };
  };

  const updateTaskProgress = async (taskType: string, increment: number = 1) => {
    if (!user) return;

    try {
      // Find tasks of this type
      const relevantTasks = availableTasks.filter(task => 
        task.task_type === taskType && !task.is_completed
      );

      for (const task of relevantTasks) {
        const newProgress = Math.min(task.current_progress + increment, task.target_value);
        const isCompleted = newProgress >= task.target_value;

        // Update or insert task progress
        await supabase
          .from('user_tasks')
          .upsert({
            user_id: user.id,
            task_id: task.id,
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });

        // If task is completed, award experience
        if (isCompleted && !task.is_completed) {
          await supabase
            .from('user_levels')
            .upsert({
              user_id: user.id,
              level: userLevel.level,
              experience_points: userLevel.experience_points + task.reward_experience
            });
        }
      }

      // Refresh data
      fetchGamificationData();
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  return {
    userLevel,
    earnedBadges,
    availableTasks,
    loading,
    updateTaskProgress,
    refreshData: fetchGamificationData
  };
}