import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMapboxToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        // Zuerst versuchen wir die Edge Function mit korrekter Authentifizierung
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          });

          if (!error && data?.token) {
            setToken(data.token);
            setLoading(false);
            return;
          }
        }

        // Fallback auf Datenbank-Abfrage
        console.log('Fallback auf Datenbank für Mapbox-Token');
        const { data: dbData, error: dbError } = await supabase
          .from('mapbox_settings')
          .select('public_token')
          .single();

        if (dbError) {
          console.error('Fehler beim Abrufen des Mapbox-Tokens aus Datenbank:', dbError);
          setError('Failed to load map configuration');
          return;
        }

        if (dbData?.public_token && dbData.public_token !== 'pk.your_mapbox_public_token_here') {
          setToken(dbData.public_token);
        } else {
          setError('Mapbox token not configured. Please contact administrator.');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Failed to load map configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  return { token, loading, error };
};