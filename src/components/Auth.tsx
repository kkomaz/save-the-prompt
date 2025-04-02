import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../utils';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Check if invite code is valid
        const { data: invites, error: inviteError } = await supabase
          .from('invites')
          .select('id')
          .eq('code', inviteCode)
          .is('user_id', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (inviteError) throw inviteError;
        if (!invites) {
          toast.error('Invalid or expired invite code');
          return;
        }

        // Create the user
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Mark invite code as used
        if (user) {
          const { error: updateError } = await supabase
            .from('invites')
            .update({ user_id: user.id })
            .eq('id', invites.id);

          if (updateError) throw updateError;
        }

        toast.success('Account created successfully!');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success('Logged in successfully!');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h2>
        <p className="text-gray-400">
          {isSignUp
            ? 'Sign up to start creating your own prompts'
            : 'Sign in to access your prompts'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        {isSignUp && (
          <div>
            <label
              htmlFor="inviteCode"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Invite Code
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className={cn(
            'w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2',
            'bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600',
            'transition-all duration-200 ease-in-out',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignUp ? (
            <>
              <UserPlus className="w-5 h-5" />
              Sign Up
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-orange-500 hover:text-orange-400 text-sm"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </motion.div>
  );
}
