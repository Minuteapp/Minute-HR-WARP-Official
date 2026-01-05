import { Button } from "@/components/ui/button";
import { Play, Pause, Edit, User, Clock, Globe, Music, Trash2, CheckCircle, CircleSlash, Download, Upload } from "lucide-react";
import { VoicemailMessage } from "@/types/voicemail.types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoicemailMessageCardProps {
  message: VoicemailMessage;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onEdit: (message: VoicemailMessage) => void;
}

const getVoiceName = (voiceId: string) => {
  const voices: { [key: string]: string } = {
    "9BWtsMINqrJLrRacOk9x": "Aria (Natürlich)",
    "CwhRBWXzGAHq8TQ4Fs17": "Roger (Geschäftlich)",
    "EXAVITQu4vr4xnSDxMaL": "Sarah (Professionell)",
    "IKne3meq5aSn9XLyUdCD": "Charlie (Freundlich)",
    "N2lVS1w4EtoT3dr4eOWO": "Callum (Klar)",
    "TX3LPaxmHKxFdv7VOQHJ": "Liam (Energisch)",
    "XB0fDUnXU5powFXDhCwa": "Charlotte (Beruhigend)"
  };
  return voices[voiceId] || "System";
};

export const VoicemailMessageCard = ({
  message,
  isPlaying,
  onPlay,
  onDelete,
  onEdit
}: VoicemailMessageCardProps) => {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);

  const handleDownload = async () => {
    if (message.audio_url) {
      const response = await fetch(message.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${message.title || 'voicemail'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return "00:00";
    const seconds = Math.floor(parseFloat(duration));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const loadProviders = async () => {
    const { data, error } = await supabase
      .from('mobile_providers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading providers:', error);
      return;
    }

    setProviders(data || []);
  };

  const handleUpload = async () => {
    if (!selectedProvider || !phoneNumber) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Provider und geben Sie eine Telefonnummer ein",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await supabase.functions.invoke('upload-voicemail', {
        body: {
          messageId: message.id,
          providerId: selectedProvider,
          phoneNumber
        }
      });

      console.log('Upload response:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Ein Fehler ist aufgetreten');
      }

      if (response.data.success) {
        toast({
          title: "Erfolg",
          description: response.data.message || "Ansage wurde erfolgreich auf die Mailbox hochgeladen"
        });
        setUploadDialogOpen(false);
      } else {
        throw new Error('Upload fehlgeschlagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Hochladen der Ansage",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 border border-[#FF6B00] shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              {message.status === 'active' ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Aktiv</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500">
                  <CircleSlash className="h-4 w-4" />
                  <span className="text-sm">Inaktiv</span>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {message.title || "Neue Ansage"}
              </h3>
            </div>
            <p className="mt-1.5 text-gray-600">{message.message_text || message.message}</p>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{getVoiceName(message.voice_id)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(message.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{message.language || "DE"}</span>
              </div>
              {message.music_title && (
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span>{message.music_title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {message.status !== 'active' && (
              <Button
                variant="outline"
                size="sm"
                className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
              >
                Aktivieren
              </Button>
            )}
            <Button
              onClick={onPlay}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-gray-600" />
              ) : (
                <Play className="h-5 w-5 text-gray-600" />
              )}
            </Button>
            <Button
              onClick={() => onEdit(message)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
            >
              <Edit className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              onClick={() => {
                loadProviders();
                setUploadDialogOpen(true);
              }}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
            >
              <Upload className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
            >
              <Trash2 className="h-5 w-5 text-[#ea384c]" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ansage auf Mailbox hochladen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobilfunkanbieter</label>
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Anbieter auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefonnummer</label>
              <Input
                type="tel"
                placeholder="+49"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Wird hochgeladen..." : "Auf Mailbox hochladen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
