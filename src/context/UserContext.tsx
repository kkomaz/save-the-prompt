import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface UserContextType {
  user: User | null;
  displayName: string;
  updateDisplayName: (newName: string) => void;
  loading: boolean;
  needsDisplayName: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [needsDisplayName, setNeedsDisplayName] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      const currentDisplayName = currentUser?.user_metadata?.display_name ?? '';
      setDisplayName(currentDisplayName);
      
      // Set needsDisplayName if user is logged in but has no display name
      setNeedsDisplayName(!!currentUser && !currentDisplayName);
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      const currentDisplayName = currentUser?.user_metadata?.display_name ?? '';
      setDisplayName(currentDisplayName);
      
      // Set needsDisplayName if user is logged in but has no display name
      setNeedsDisplayName(!!currentUser && !currentDisplayName);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateDisplayName = (newName: string) => {
    setDisplayName(newName);
    setNeedsDisplayName(false);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      displayName, 
      updateDisplayName, 
      loading,
      needsDisplayName 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}