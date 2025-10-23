import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

export function TasksPanel() {
  const { availableTasks, loading } = useGamification();

  if (loading) return null;

  const activeTasks = availableTasks.filter(task => !task.is_completed).slice(0, 3);
  
  if (activeTasks.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Active Tasks
        </CardTitle>
        <CardDescription>
          Complete tasks to earn experience and level up!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTasks.map((task) => {
          const progress = (task.current_progress / task.target_value) * 100;
          
          return (
            <div key={task.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  {task.reward_experience} XP
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{task.current_progress}/{task.target_value}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}