import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Bookmark, Heart, User, Users, Archive, LogOut, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeftSidebar() {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Heart, label: 'Liked Pages', path: '/liked' },
    { icon: Archive, label: 'Archive', path: '/archive' },
    { icon: Users, label: 'Community', path: '/community' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <Card className="p-5 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-24 mx-auto" />
              <Skeleton className="h-3 w-32 mx-auto" />
            </div>
            <div className="flex gap-4 pt-3 border-t border-border/50 w-full justify-center">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ) : (
          <>
            <Link to="/profile" className="flex flex-col items-center text-center space-y-3 group">
              <Avatar className="h-16 w-16 border-2 border-border group-hover:border-primary transition-colors">
                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-base font-semibold">
                  {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 w-full">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                  {profile?.display_name || profile?.username}
                </p>
                {profile?.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </Link>
            
            <div className="mt-4 pt-3 border-t border-border/50 flex justify-around text-xs">
              <div className="text-center">
                <p className="font-bold text-base">{profile?.followers_count || 0}</p>
                <p className="text-muted-foreground font-medium">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base">{profile?.following_count || 0}</p>
                <p className="text-muted-foreground font-medium">Following</p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Navigation */}
      <Card className="p-3 shadow-sm">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </Card>

      {/* Sign Out */}
      <Card className="p-4 shadow-sm">
        <Button 
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
