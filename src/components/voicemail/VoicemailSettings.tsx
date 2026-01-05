
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SaveAll } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VoicemailSettings = () => {
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedMusic, setSelectedMusic] = useState("");
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Nicht eingeloggt");

      const { error } = await supabase
        .from('voicemail_settings')
        .upsert({
          user_id: user.id,
          voice_id: selectedVoice,
          music_preference: selectedMusic,
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich gespeichert",
        description: "Ihre Einstellungen wurden aktualisiert.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ihre Einstellungen konnten nicht gespeichert werden.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Stimme auswählen</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Bitte wählen Sie eine Stimme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="voice1">Männliche Stimme 1</SelectItem>
              <SelectItem value="voice2">Männliche Stimme 2</SelectItem>
              <SelectItem value="voice3">Weibliche Stimme 1</SelectItem>
              <SelectItem value="voice4">Weibliche Stimme 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hintergrundmusik</label>
          <Select value={selectedMusic} onValueChange={setSelectedMusic}>
            <SelectTrigger>
              <SelectValue placeholder="Bitte wählen Sie Hintergrundmusik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Musik</SelectItem>
              <SelectItem value="classic">Klassisch</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <SaveAll className="h-4 w-4" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default VoicemailSettings;
