
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import VoicemailAnnouncementForm from "./VoicemailAnnouncementForm";
import VoicemailAudioControls from "./VoicemailAudioControls";
import { useVoicemailAudio } from "@/hooks/useVoicemailAudio";
import { createVoicemailAnnouncement } from "@/services/voicemailService";

interface NewVoicemailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewVoicemailDialog = ({ open, onOpenChange }: NewVoicemailDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: "standard",
    text: "",
    voice: "",
    music: "none"
  });

  const {
    audioUrl,
    audioContent,
    isPlaying,
    loading,
    isGenerating,
    generatePreview,
    loadBackgroundMusic,
    handlePlayPause,
    resetAudio
  } = useVoicemailAudio();

  const handleGeneratePreview = async () => {
    try {
      const result = await generatePreview(formData.text, formData.voice);
      if (result && formData.music && formData.music !== "none") {
        await loadBackgroundMusic(formData.music);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Generieren der Vorschau",
        variant: "destructive"
      });
    }
  };

  const handleTextChange = () => {
    resetAudio();
  };

  const handleCreateAnnouncement = async () => {
    if (!audioContent || !audioUrl || !formData.voice || !formData.text) {
      toast({
        title: "Fehler",
        description: "Bitte generieren Sie zuerst eine Vorschau",
        variant: "destructive"
      });
      return;
    }

    if (isGenerating) {
      toast({
        title: "Bitte warten",
        description: "Eine Vorschau wird noch generiert.",
      });
      return;
    }

    try {
      await createVoicemailAnnouncement({
        ...formData,
        audioContent,
        audioUrl,
        music: formData.music === "none" ? null : formData.music
      });

      // Liste sofort aktualisieren
      await queryClient.invalidateQueries({ queryKey: ['voicemail-messages'] });

      toast({
        title: "Erfolg",
        description: "Ansage wurde erstellt"
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      let errorMessage = "Fehler beim Erstellen der Ansage";
      
      if (error.message?.includes('too_many_concurrent_requests')) {
        errorMessage = "Zu viele gleichzeitige Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Ansage erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <VoicemailAnnouncementForm 
            formData={formData}
            onChange={setFormData}
            onTextChange={handleTextChange}
          />

          <VoicemailAudioControls 
            audioUrl={audioUrl}
            isGenerating={isGenerating}
            onGeneratePreview={handleGeneratePreview}
            onCreateAnnouncement={handleCreateAnnouncement}
            formData={formData}
            loading={loading}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewVoicemailDialog;
