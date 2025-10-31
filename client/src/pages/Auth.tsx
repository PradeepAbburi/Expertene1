import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  // Forgot password state and handler
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  // Functions base: prefer env override, otherwise use local Supabase Functions during dev
  const _envBase = (import.meta as any).env?.VITE_FUNCTIONS_BASE;
  const FUNCTIONS_BASE = _envBase || ((import.meta as any).env?.DEV ? 'http://localhost:54321/functions/v1' : '/functions/v1');
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      // Use server-side send-reset-link function to email a reset link
      let res;
      try {
        res = await fetch(`${FUNCTIONS_BASE}/send-reset-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail }),
        });
      } catch (netErr: any) {
        // network-level errors (e.g. CORS or functions not reachable)
        toast({ title: 'Network error', description: 'Could not reach the functions endpoint. Make sure your functions are deployed or that VITE_FUNCTIONS_BASE is set correctly (for local dev use http://localhost:54321/functions/v1).', variant: 'destructive' });
        throw netErr;
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'failed_to_send_reset_link');
      toast({ title: 'Reset link sent', description: 'Check your email for the password reset link.' });
      setShowForgot(false);
      setForgotEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  
  const enableUsernameLogin = (import.meta as any).env?.VITE_ENABLE_USERNAME_LOGIN === 'true';
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms and Conditions to create an account.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            display_name: username,
          }
        }
      });

      if (error) throw error;
      // Inform user that a verification link has been sent and show message on Sign In tab
      const msg = `A verification link has been sent to ${email}. Please check your inbox to confirm your account.`;
      setVerificationMessage(msg);
      setActiveTab('signin');
      toast({ title: 'Check your email', description: 'We sent a verification link. Please confirm to continue.' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for admin credentials first (local login)
      const ADMIN_EMAIL = 'expertene@admin.com';
      const ADMIN_PASSWORD = 'Vortex@expertene';
      
      if (identifier.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('expertene_admin_authed', 'true');
        toast({
          title: "Welcome, Admin!",
          description: "Redirecting to admin dashboard...",
        });
        navigate('/admin');
        return;
      }

      // Normal user login via Supabase
      let loginEmail = identifier;
      const isEmail = /.+@.+\..+/.test(identifier);
      if (!isEmail) {
        if (!enableUsernameLogin) {
          toast({
            title: 'Use your email to sign in',
            description: 'Username sign-in is not enabled yet on this environment.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        const { data: resolved, error: rpcError } = await (supabase as any).rpc('get_email_by_username', { p_username: identifier });
        if (rpcError) {
          toast({
            title: 'Username login unavailable',
            description: 'Please sign in using your email address for now.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        if (!resolved) {
          toast({
            title: 'Username not found',
            description: 'Check the username or use your email address to sign in.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        loginEmail = resolved as string;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;

      navigate('/feed');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Social sign-in handlers can be re-enabled when needed

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      
      <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-2 relative z-10">
        {/* Grid boxes background behind form */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 32px)`
        }} />
        {/* Left: Hero/Branding - Hidden on mobile */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 p-8 lg:p-16 text-white hidden lg:flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20" />
          <div className="relative z-10 max-w-xl">
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                Expertene
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-12">
                Share your knowledge, grow your audience, and connect with a community of passionate creators.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 h-14 w-14 rounded-xl border-2 border-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Create & Publish</h3>
                  <p className="text-white/80 text-base">Write beautiful articles with rich media, code snippets, and more.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 h-14 w-14 rounded-xl border-2 border-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Build Your Brand</h3>
                  <p className="text-white/80 text-base">Reach engaged readers and grow your following organically.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 h-14 w-14 rounded-xl border-2 border-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Earn & Thrive</h3>
                  <p className="text-white/80 text-base">Unlock rewards and monetization as your content gains traction.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth Forms */}
  <div className="p-6 lg:p-12 bg-black text-white flex items-center justify-center h-full rounded-none shadow-none relative z-10">
          {/* checkbox-grid background pattern behind the form (non-interactive) */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              opacity: 0.35,
              backgroundRepeat: 'repeat',
              backgroundPosition: '0 0',
              backgroundSize: '40px 40px',
              // SVG pattern for a small rounded checkbox square
              backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect x='6' y='6' width='28' height='28' rx='4' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='2'/></svg>")}")`
            }}
            className="rounded-none"
          />
          <div className="w-full max-w-md relative z-10">
            <div className="mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account or create a new one</p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                <TabsTrigger value="signin" className="text-base font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-base font-medium">Sign Up</TabsTrigger>
              </TabsList>

                  <TabsContent value="signin" className="mt-0">
                    {verificationMessage && activeTab === 'signin' && (
                      <div className="mb-4 p-3 rounded-md bg-primary/5 text-primary">
                        {verificationMessage}
                      </div>
                    )}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="text-sm font-medium">Username or Email</Label>
                      <Input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your username or email"
                        required
                        className="h-10"
                      />
                      {!enableUsernameLogin && (
                        <p className="text-xs text-muted-foreground">Use your email to sign in for now</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showSignInPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="h-10 pr-10"
                        />
                        <button
                          type="button"
                          aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowSignInPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-10 text-base font-semibold" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className="text-primary text-sm hover:underline focus:outline-none"
                        onClick={() => setShowForgot(true)}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username" className="text-sm font-medium">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a unique username"
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          required
                          className="h-10 pr-10"
                        />
                        <button
                          type="button"
                          aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowSignUpPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Min. 8 characters</p>
                    </div>
                    
                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-start space-x-3 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        required
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-xs leading-relaxed cursor-pointer"
                        >
                          I agree to the{' '}
                          <Link 
                            to="/terms" 
                            className="text-primary hover:underline font-semibold"
                            target="_blank"
                          >
                            Terms and Conditions
                          </Link>
                          {' '}and{' '}
                          <Link 
                            to="/privacy" 
                            className="text-primary hover:underline font-semibold"
                            target="_blank"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-10 text-base font-semibold" disabled={loading || !agreeToTerms}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-lg shadow-lg p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Reset Password</h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgotEmail">Email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="text-sm text-muted-foreground">We'll send a password reset link to your email with instructions to choose a new password.</div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForgot(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes float-diagonal-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(80vw, 80vh); }
        }
        @keyframes float-diagonal-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(70vw, -70vh); }
        }
        @keyframes float-diagonal-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-60vw, 60vh); }
        }
        @keyframes float-diagonal-4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-50vw, -50vh); }
        }
        @keyframes float-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(90vw); }
        }
        @keyframes float-horizontal-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-90vw); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30vw, 20vh) rotate(90deg); }
          50% { transform: translate(20vw, 40vh) rotate(180deg); }
          75% { transform: translate(-10vw, 20vh) rotate(270deg); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-30vw, -20vh) rotate(-90deg); }
          50% { transform: translate(-20vw, -40vh) rotate(-180deg); }
          75% { transform: translate(10vw, -20vh) rotate(-270deg); }
        }
        .animate-float-diagonal-1 { animation: float-diagonal-1 25s ease-in-out infinite; }
        .animate-float-diagonal-2 { animation: float-diagonal-2 30s ease-in-out infinite; }
        .animate-float-diagonal-3 { animation: float-diagonal-3 28s ease-in-out infinite; }
        .animate-float-diagonal-4 { animation: float-diagonal-4 32s ease-in-out infinite; }
        .animate-float-horizontal { animation: float-horizontal 20s linear infinite; }
        .animate-float-horizontal-reverse { animation: float-horizontal-reverse 22s linear infinite; }
        .animate-float-slow { animation: float-slow 35s ease-in-out infinite; }
        .animate-float-slow-reverse { animation: float-slow-reverse 38s ease-in-out infinite; }
      `}</style>
    </div>
  );
}