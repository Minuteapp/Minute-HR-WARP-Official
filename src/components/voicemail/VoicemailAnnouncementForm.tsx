
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface VoicemailAnnouncementFormProps {
  formData: {
    type: string;
    text: string;
    voice: string;
    music: string;
  };
  onChange: (data: any) => void;
  onTextChange?: (text: string) => void;
}

const VoicemailAnnouncementForm = ({ formData, onChange, onTextChange }: VoicemailAnnouncementFormProps) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...formData, text: e.target.value });
    onTextChange?.(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Art der Ansage</label>
        <Select
          value={formData.type}
          onValueChange={(value) => onChange({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Standard Ansage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Ansage</SelectItem>
            <SelectItem value="meeting">Meeting/Beschäftigt</SelectItem>
            <SelectItem value="urlaub">Urlaub</SelectItem>
            <SelectItem value="vertretung">Vertretung</SelectItem>
            <SelectItem value="custom">Benutzerdefiniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === "custom" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Freitext</label>
          <Textarea 
            placeholder="Geben Sie hier Ihren Freitext ein..."
            value={formData.text}
            onChange={handleTextChange}
            rows={4}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">Text</label>
          <Textarea 
            placeholder="Geben Sie hier Ihren Text ein..."
            value={formData.text}
            onChange={handleTextChange}
            rows={4}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Stimme auswählen</label>
        <Select
          value={formData.voice}
          onValueChange={(value) => onChange({ ...formData, voice: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie eine Stimme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Natürlich)</SelectItem>
            <SelectItem value="CwhRBWXzGAHq8TQ4Fs17">Roger (Geschäftlich)</SelectItem>
            <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Professionell)</SelectItem>
            <SelectItem value="IKne3meq5aSn9XLyUdCD">Charlie (Freundlich)</SelectItem>
            <SelectItem value="N2lVS1w4EtoT3dr4eOWO">Callum (Klar)</SelectItem>
            <SelectItem value="TX3LPaxmHKxFdv7VOQHJ">Liam (Energisch)</SelectItem>
            <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte (Beruhigend)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Hintergrundmusik</label>
        <Select
          value={formData.music}
          onValueChange={(value) => onChange({ ...formData, music: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie Musik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keine Musik</SelectItem>
            <SelectItem value="voicemail-corporate1">Corporate 1</SelectItem>
            <SelectItem value="voicemail-corporate2">Corporate 2</SelectItem>
            <SelectItem value="voicemail-corporate4">Corporate 4</SelectItem>
            <SelectItem value="voicemail-relaxed2">Relaxed 2</SelectItem>
            <SelectItem value="voicemail-relaxed3">Relaxed 3</SelectItem>
            <SelectItem value="voicemail-uplifting2">Uplifting 2</SelectItem>
            <SelectItem value="voicemail-uplifting3">Uplifting 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VoicemailAnnouncementForm;
