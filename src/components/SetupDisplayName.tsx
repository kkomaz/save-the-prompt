import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';
import { cn } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function SetupDisplayName({ onComplete }: { onComplete: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { updateDisplayName } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;

      // Update user metadata with the new display name
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      // Show updating state
      setIsUpdating(true);

      // Wait for session refresh and verify the update
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      // Verify the display name was updated in the session
      if (session?.user?.user_metadata?.display_name === displayName) {
        updateDisplayName(displayName);
        toast.success('Display name set successfully');
        onComplete();
        navigate('/dashboard');
      } else {
        throw new Error('Display name update not reflected in session');
      }
    } catch (error) {
      console.error('Error setting display name:', error);
      toast.error('Error setting display name');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-6 w-full max-w-md border border-gray-800"
      >
        {isUpdating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-400">Updating your profile...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <UserCircle2 className="w-8 h-8 text-orange-500" />
              <h2 className="text-xl font-semibold">Set Your Display Name</h2>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Important Notice</span>
              </div>
              <p className="text-red-400 text-sm">
                Your display name cannot be changed after it's set. Please choose carefully as this will be your permanent identifier.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2 bg-gray-800/50 rounded-lg border",
                    "border-gray-700 focus:outline-none focus:border-orange-500",
                    "placeholder:text-gray-500"
                  )}
                  placeholder="Enter your display name"
                  disabled={loading}
                />
              </div>

              <motion.button
                type="submit"
                className={cn(
                  "w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-orange-500 to-purple-500",
                  "hover:from-orange-600 hover:to-purple-600",
                  "transition-all duration-200 ease-in-out",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Set Display Name'
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}