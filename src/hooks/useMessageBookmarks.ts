import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Bookmark {
  id: string;
  message_id: string;
  channel_id: string | null;
  created_at: string;
}

export const useMessageBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('message_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Lesezeichen:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback((messageId: string) => {
    return bookmarks.some(b => b.message_id === messageId);
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (messageId: string, channelId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um Lesezeichen zu speichern.",
          variant: "destructive"
        });
        return false;
      }

      const existingBookmark = bookmarks.find(b => b.message_id === messageId);

      if (existingBookmark) {
        // Lesezeichen entfernen
        const { error } = await supabase
          .from('message_bookmarks')
          .delete()
          .eq('id', existingBookmark.id);

        if (error) throw error;

        setBookmarks(prev => prev.filter(b => b.id !== existingBookmark.id));
        toast({
          title: "Lesezeichen entfernt",
          description: "Das Lesezeichen wurde erfolgreich entfernt."
        });
        return false;
      } else {
        // Lesezeichen hinzufügen
        const { data, error } = await supabase
          .from('message_bookmarks')
          .insert({
            user_id: user.id,
            message_id: messageId,
            channel_id: channelId || null
          })
          .select()
          .single();

        if (error) throw error;

        setBookmarks(prev => [data, ...prev]);
        toast({
          title: "Lesezeichen gespeichert",
          description: "Die Nachricht wurde zu Ihren Lesezeichen hinzugefügt."
        });
        return true;
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Lesezeichens:', error);
      toast({
        title: "Fehler",
        description: "Das Lesezeichen konnte nicht gespeichert werden.",
        variant: "destructive"
      });
      return null;
    }
  }, [bookmarks, toast]);

  return {
    bookmarks,
    loading,
    isBookmarked,
    toggleBookmark,
    refetch: fetchBookmarks
  };
};
