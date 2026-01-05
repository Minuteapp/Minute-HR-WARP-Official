
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVoicemailPlayer } from "@/hooks/useVoicemailPlayer";
import { VoicemailMessageList } from "./VoicemailMessageList";
import { VoicemailMessage } from "@/types/voicemail.types";

const VoicemailMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isPlaying, handlePlay } = useVoicemailPlayer();
  const [editMessage, setEditMessage] = useState<VoicemailMessage | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['voicemail-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voicemail_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching voicemail messages:', error);
        throw error;
      }
      
      return data as VoicemailMessage[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log('Deleting message with ID:', messageId);
      
      // Erst die Nachricht abrufen, um die Audio-URL zu bekommen
      const { data: message } = await supabase
        .from('voicemail_messages')
        .select('audio_url')
        .eq('id', messageId)
        .single();

      if (message?.audio_url) {
        // Versuchen, die Audio-Datei aus dem Storage zu löschen
        try {
          const audioPath = new URL(message.audio_url).pathname.split('/').pop();
          if (audioPath) {
            await supabase.storage.from('audio').remove([audioPath]);
          }
        } catch (error) {
          console.error('Error deleting audio file:', error);
        }
      }

      const { error } = await supabase
        .from('voicemail_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voicemail-messages'] });
      toast({
        title: "Erfolg",
        description: "Ansage wurde gelöscht"
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Ansage",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (message: VoicemailMessage) => {
    setEditMessage(message);
    toast({
      title: "Info",
      description: "Bearbeitung wird implementiert"
    });
  };

  const handleDelete = (id: string) => {
    console.log('Attempting to delete message:', id);
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="text-center py-8">Lade Ansagen...</div>;
  }

  return (
    <VoicemailMessageList
      messages={messages || []}
      isPlaying={isPlaying}
      onPlay={handlePlay}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
};

export default VoicemailMessages;
