import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { useProfile } from './ProfileContext';
import { toast } from 'sonner';

interface MaintenanceContextType {
  maintenanceMode: boolean;
  setMaintenanceMode: (value: boolean) => void;
  loading: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [maintenanceMode, setMaintenanceModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    fetchMaintenanceStatus();

    // Subscribe to maintenance changes
    const channel = supabase
      .channel('maintenance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance'
        },
        (payload) => {
          const newStatus = payload.new as { is_active: boolean };
          setMaintenanceModeState(newStatus.is_active);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('is_active')
        .single();

      if (error) throw error;
      setMaintenanceModeState(data.is_active);
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      toast.error('Error fetching maintenance status');
    } finally {
      setLoading(false);
    }
  };

  const setMaintenanceMode = async (value: boolean) => {
    if (!profile?.is_admin) {
      toast.error('Only admins can change maintenance mode');
      return;
    }

    try {
      // First, get the maintenance record
      const { data: maintenanceRecord, error: fetchError } = await supabase
        .from('maintenance')
        .select('id')
        .single();

      if (fetchError) {
        console.error('Error fetching maintenance record:', fetchError);
        toast.error('Error fetching maintenance record');
        return;
      }

      // Update the maintenance status using the record's ID
      const { error: updateError } = await supabase
        .from('maintenance')
        .update({ is_active: value })
        .eq('id', maintenanceRecord.id);

      if (updateError) throw updateError;

      setMaintenanceModeState(value);
      toast.success(value ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      toast.error('Error updating maintenance status');
    }
  };

  return (
    <MaintenanceContext.Provider value={{ maintenanceMode, setMaintenanceMode, loading }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}