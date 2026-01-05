
import { useState, useEffect } from 'react';
import { SickLeave } from '@/types/sick-leave';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSickLeaves = () => {
  const [sickLeaves, setSickLeaves] = useState<SickLeave[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSickLeaves = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching sick leaves for user:', user.id);
      
      // Daten aus der Datenbank abrufen
      const { data: sickLeavesData, error: sickLeavesError } = await supabase
        .from('sick_leaves')
        .select('*')
        .order('created_at', { ascending: false });

      if (sickLeavesError) {
        console.error('Error fetching sick leaves:', sickLeavesError);
        throw new Error(`Fehler beim Laden der Krankmeldungen: ${sickLeavesError.message}`);
      }
      
      console.log('Sick leaves data:', sickLeavesData);
      
      // Teamdaten abrufen - falls die Tabelle existiert
      let teamData = [];
      try {
        const { data: teamResponse, error: teamError } = await supabase
          .from('profiles')
          .select('id, full_name, department');

        if (teamError) {
          console.warn('Could not fetch team data:', teamError.message);
          // Ignoriere den Fehler und setze leeres Array
        } else {
          teamData = teamResponse || [];
        }
      } catch (teamErr) {
        console.warn('Profiles table might not exist:', teamErr);
      }
      
      setSickLeaves(sickLeavesData || []);
      setTeam(teamData);
      
    } catch (err) {
      console.error('Error in fetchSickLeaves:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Krankmeldungen';
      setError(new Error(errorMessage));
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSickLeaves();
  }, [user?.id]);

  return {
    sickLeaves,
    team,
    isLoading,
    error,
    fetchSickLeaves
  };
};
