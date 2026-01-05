import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SickLeave } from '@/types/sick-leave';
import { useAuth } from '@/contexts/AuthProvider';

export const useMySickLeaves = () => {
  const [sickLeaves, setSickLeaves] = useState<SickLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMySickLeaves = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sick_leaves')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching sick leaves:', error);
        } else {
          setSickLeaves(data || []);
        }
      } catch (err) {
        console.error('Error in useMySickLeaves:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySickLeaves();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('sick_leaves_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sick_leaves',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchMySickLeaves();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { sickLeaves, isLoading };
};
