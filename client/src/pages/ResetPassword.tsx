import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Compute functions base same as Auth.tsx: env override, dev defaults to local functions
  const _envBase = (import.meta as any).env?.VITE_FUNCTIONS_BASE;
  const FUNCTIONS_BASE = _envBase || ((import.meta as any).env?.DEV ? 'http://localhost:54321/functions/v1' : '/functions/v1');

  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) setResetToken(t);
  }, [location.search]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (resetToken) {
        // Use server-side complete-reset function to exchange the reset token for a password change
        let res;
        try {
          res = await fetch(`${FUNCTIONS_BASE}/complete-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, new_password: newPassword }),
          });
        } catch (netErr: any) {
          setError('Network error: could not reach functions endpoint.');
          throw netErr;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.error || 'Failed to complete password reset.');
          throw new Error(json?.error || 'complete_reset_failed');
        }
        setSuccess(true);
        setTimeout(() => navigate('/auth'), 2000);
      } else {
        // Fallback: update password for signed-in user
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setSuccess(true);
        setTimeout(() => navigate('/auth'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {success ? (
          <div className="text-green-600 text-center mb-4">Password reset successful! Redirecting...</div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm new password"
              />
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
