import {
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Auth } from './components/Auth';
import { PromptList } from './components/PromptList';
import { Dashboard } from './components/Dashboard';
import { SetupDisplayName } from './components/SetupDisplayName';
import { UserCircle2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import { toast } from 'sonner';
import { UserProvider, useUser } from './context/UserContext';
import {
  MaintenanceProvider,
  useMaintenance,
} from './context/MaintenanceContext';
import { ProfileProvider } from './context/ProfileContext';

function AppContent() {
  const { user, needsDisplayName, loading } = useUser();
  const { maintenanceMode } = useMaintenance();
  const [showDisplayNameSetup, setShowDisplayNameSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (needsDisplayName) {
      setShowDisplayNameSetup(true);
    } else {
      setShowDisplayNameSetup(false);
    }
  }, [needsDisplayName]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleDisplayNameComplete = () => {
    setShowDisplayNameSetup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {showDisplayNameSetup && (
        <SetupDisplayName onComplete={handleDisplayNameComplete} />
      )}
      <Toaster theme="dark" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20 pointer-events-none" />
      <div className="relative">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <motion.header
          className="mb-8 sm:mb-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <motion.img
                src="https://u.cubeupload.com/itskkoma/stp.png"
                alt="heyAnon logo"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring-2 ring-orange-500/50"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              />
              <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-500">
                Save The <span>Prompt</span>
              </h1>
            </Link>
            <p className="text-gray-400 text-sm sm:text-base flex items-center gap-2">
              Your AI prompt collection for HeyAnon{' '}
              <span>
                <img
                  src="https://pbs.twimg.com/profile_images/1894035469614104576/Gk3WK_Mm_400x400.jpg"
                  alt="heyAnon logo"
                  className="w-6 h-6 mt-0.5"
                />
              </span>
            </p>
          </div>

          <div className="flex justify-end">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <motion.button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserCircle2 className="w-4 h-4" />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </motion.header>

        <Routes>
          <Route
            path="/"
            element={
              maintenanceMode ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <img
                    src="https://u.cubeupload.com/itskkoma/laptop.png"
                    alt="Maintenance Mode"
                    className="max-w-md w-full rounded-lg mb-6 shadow-xl"
                  />
                  <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-500">
                    Under Maintenance
                  </h1>
                  <p className="text-gray-400 text-center max-w-md">
                    We're making some improvements to our system. We'll be back
                    online shortly!
                  </p>
                </div>
              ) : (
                <PromptList />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                showDisplayNameSetup ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <Dashboard />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <ProfileProvider>
        <MaintenanceProvider>
          <AppContent />
        </MaintenanceProvider>
      </ProfileProvider>
    </UserProvider>
  );
}

export default App;
