import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { PlusCircle, Flame } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { useEffect, useState } from 'react';
import OrbitSpinner from '@/components/ui/OrbitSpinner';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Google AdSense script loader
  useEffect(() => {
    const scriptId = 'adsbygoogle-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1115531355970011';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [streak, setStreak] = useState(0);
  const [sessionStart] = useState(Date.now());
  const navigate = useNavigate();
  const [navLoading, setNavLoading] = useState(false);

  // Minimum navigation loading time (ms), configurable via VITE_NAV_LOADING_MS.
  // Default to a visible delay across devices so the "Opening editor..." message is seen.
  const NAV_MIN_MS = Number((import.meta as any).env?.VITE_NAV_LOADING_MS ?? 800);
  // Optional additional wait after navigation to allow the editor to mount visibly
  const NAV_POST_MS = 300;

  const handleDelayedNav = async (path: string) => {
    // if already loading or already on target, no-op
    if (navLoading || location.pathname === path) return;
    setNavLoading(true);

    try {
      // wait at least NAV_MIN_MS so users see the opening message
      await new Promise((res) => setTimeout(res, NAV_MIN_MS));
    } catch (e) {
      // ignore
    }

    // Navigate while keeping the overlay visible; hide it shortly after to
    // allow the editor page to render under the overlay for a smooth transition.
    navigate(path);

    try {
      await new Promise((res) => setTimeout(res, NAV_POST_MS));
    } catch (e) {}

    setNavLoading(false);
  };
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/auth';
  // Only show sidebars on feed page
  const showSidebars = location.pathname === '/feed';

  // Announcements bar state
  const [announcements, setAnnouncements] = useState<{ id: string | null | undefined; title: string | null | undefined; message: string }[]>([]);
  useEffect(() => {
    // Only fetch active announcements for non-admin routes
    if (isAdminRoute) return;
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('announcements')
          .select('id, title, message, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          setAnnouncements(data);
        }
      } catch (e) {
        // fail silently
      }
    })();
  }, [isAdminRoute]);

  // Track user session time and update streak
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let interval: NodeJS.Timeout;

    const trackSession = async () => {
      const sessionDuration = Date.now() - sessionStart;
      const thirtyMinutes = 30 * 60 * 1000;

      if (sessionDuration >= thirtyMinutes) {
        // Update streak in database
        const today = new Date().toISOString().split('T')[0];
        
        const sb = supabase as any;
        const { data: existingStreak } = await sb
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingStreak) {
          const lastActiveDate = new Date(existingStreak.last_active_date).toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          if (lastActiveDate === today) {
            // Already counted today
            return;
          } else if (lastActiveDate === yesterday) {
            // Continue streak
            await sb
              .from('user_streaks')
              .update({
                current_streak: existingStreak.current_streak + 1,
                longest_streak: Math.max(existingStreak.longest_streak, existingStreak.current_streak + 1),
                last_active_date: new Date().toISOString(),
                total_active_days: existingStreak.total_active_days + 1,
              })
              .eq('user_id', user.id);
            
            setStreak(existingStreak.current_streak + 1);
          } else {
            // Streak broken, restart
            await sb
              .from('user_streaks')
              .update({
                current_streak: 1,
                last_active_date: new Date().toISOString(),
                total_active_days: existingStreak.total_active_days + 1,
              })
              .eq('user_id', user.id);
            
            setStreak(1);
          }
        } else {
          // Create new streak record
          await sb
            .from('user_streaks')
            .insert({
              user_id: user.id,
              current_streak: 1,
              longest_streak: 1,
              last_active_date: new Date().toISOString(),
              total_active_days: 1,
            });
          
          setStreak(1);
        }
      }
    };

    // Check every 5 minutes
    interval = setInterval(trackSession, 5 * 60 * 1000);
    
    // Also check once immediately after 30 minutes
    setTimeout(trackSession, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, sessionStart]);

  // Fetch current streak on mount
  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) return;

      const sb = supabase as any;
      const { data } = await sb
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStreak(data.current_streak);
      }
    };

    fetchStreak();
  }, [user]);

  // Listen for immediate streak updates from client actions (e.g., after creating a post)
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        // @ts-ignore
        const detail = (e as CustomEvent).detail;
        if (detail && typeof detail.streak === 'number') {
          setStreak(detail.streak);
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('streak-updated', handler as EventListener);
    return () => window.removeEventListener('streak-updated', handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation loading overlay shown when user clicks Write and we delay navigation */}
      {navLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 overlay-fade">
          <style>{`
            .overlay-fade{opacity:0;animation:overlay-fade-in 220ms ease-out forwards}
            @keyframes overlay-fade-in{to{opacity:1}}
          `}</style>
          <div className="flex flex-col items-center gap-4 text-primary">
            <OrbitSpinner size={56} />
            <div className="text-lg font-medium">Opening editor...</div>
          </div>
        </div>
      )}
      {/* Fixed Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b ${isAuthRoute ? 'bg-background' : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'}`}>
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile only - Hamburger menu */}
            {isAuthenticated && <div className="lg:hidden"><HamburgerMenu /></div>}
            <Link to={isAuthenticated ? "/feed" : "/"} className="text-xl font-bold gradient-primary bg-clip-text text-transparent whitespace-nowrap">
              Expertene
            </Link>
            {/* ...existing code... */}
          </div>
          {/* Desktop SearchBar */}
          {isAuthenticated && <div className="hidden sm:block flex-1 max-w-md"><SearchBar /></div>}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Streak Icon */}
                <Link to="/leaderboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <Badge variant="secondary" className="font-bold">
                    {streak}
                  </Badge>
                </Link>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                  <button type="button" onClick={() => handleDelayedNav('/create')} className="flex items-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Write
                  </button>
                </Button>
                {/* Logout in navbar only on admin routes */}
                {isAdminRoute && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="sm:ml-2"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      localStorage.removeItem('expertene_admin_authed');
                      window.location.href = '/auth';
                    }}
                  >
                    Logout
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </header>
      {/* Announcements Bar - below navbar, only after login and on non-admin routes */}
      {isAuthenticated && !isAdminRoute && announcements.length > 0 && (
        <div className="fixed top-14 left-0 right-0 w-full bg-white border-b border-gray-200 text-black py-2 overflow-hidden z-40">
          <div className="marquee whitespace-nowrap flex items-center gap-8 animate-marquee px-4">
            {announcements.map(a => (
              <span key={a.id} className="flex items-center gap-2">
                <span className="font-bold"><span className="mr-1">📢</span>{a.title}:</span>
                <span className="font-normal">{a.message}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Mobile SearchBar - Fixed under navbar */}
      {isAuthenticated && (
        <div className="fixed top-[56px] left-0 right-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden">
          <div className="container flex h-14 items-center gap-4 px-4">
            <SearchBar />
              <Button asChild variant="ghost" size="sm">
                <button type="button" onClick={() => handleDelayedNav('/create')} className="flex items-center">
                  <PlusCircle className="h-4 w-4" />
                </button>
              </Button>
          </div>
        </div>
      )}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-[56px] sm:pt-[56px] lg:pt-[56px]">
        {isAuthenticated ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            {showSidebars ? (
              // Feed page with sidebars
              <div className="hidden lg:grid lg:grid-cols-[260px_1fr_320px] gap-8 py-6 h-[calc(100vh-56px)]">
                <aside className="sticky top-[72px] h-[calc(100vh-88px)] overflow-y-auto scrollbar-hide">
                  <LeftSidebar />
                </aside>
                <main className="min-w-0 max-w-3xl h-full overflow-y-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {/* Only Feed should scroll, hide scrollbar */}
                  {location.pathname === '/feed' ? (
                    <div className="h-full overflow-y-auto scrollbar-hide">
                      {children}
                    </div>
                  ) : (
                    <div>
                      {children}
                    </div>
                  )}
                </main>
                <aside className="sticky top-[72px] h-[calc(100vh-88px)] overflow-y-auto scrollbar-hide">
                  <RightSidebar />
                </aside>
              </div>
            ) : (
              // Other pages without sidebars
              <div className="hidden lg:block py-6">
                <main className="max-w-4xl mx-auto">
                  {children}
                </main>
              </div>
            )}
            {/* Mobile/Tablet view without sidebars */}
            <main className="lg:hidden py-6">
              {children}
            </main>
          </div>
        ) : (
          <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        )}
      </div>
  {!isAuthRoute && location.pathname !== '/' && <Footer />}
      {/* Marquee animation styles and scrollbar hide */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        /* Hide scrollbar for Feed */
        .scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}