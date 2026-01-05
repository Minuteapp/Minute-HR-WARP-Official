import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SickLeave } from '@/types/sick-leave';
import { useAuth } from '@/contexts/AuthProvider';

export const useMyActiveSickLeave = () => {
  const [activeSickLeave, setActiveSickLeave] = useState<SickLeave | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveSickLeave = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('sick_leaves')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['approved', 'pending'])
          .gte('end_date', today)
          .order('start_date', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching active sick leave:', error);
        } else {
          setActiveSickLeave(data);
        }
      } catch (err) {
        console.error('Error in useMyActiveSickLeave:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSickLeave();
  }, [user?.id]);

  return { activeSickLeave, isLoading };
};
