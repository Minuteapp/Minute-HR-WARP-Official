
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";

interface VoicemailAudioControlsProps {
  audioUrl: string | null;
  isGenerating: boolean;
  onGeneratePreview: () => void;
  onCreateAnnouncement: () => void;
  formData: {
    voice: string;
    text: string;
  };
  loading: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const VoicemailAudioControls = ({
  audioUrl,
  isGenerating,
  onGeneratePreview,
  onCreateAnnouncement,
  formData,
  loading,
  isPlaying,
  onPlayPause
}: VoicemailAudioControlsProps) => {
  return (
    <div className="space-y-2">
      {audioUrl ? (
        <div className="flex flex-col space-y-2 w-full">
          <Button 
            className="w-full bg-[#FFB485] hover:bg-[#FFB485]/90 text-white"
            onClick={onPlayPause}
            disabled={isGenerating}
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? "Pause" : "Abspielen"}
          </Button>
          <Button
            className="w-full bg-[#FFB485] hover:bg-[#FFB485]/90 text-white"
            onClick={onGeneratePreview}
            disabled={!formData.voice || !formData.text || loading || isGenerating}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading || isGenerating ? "Generiere..." : "Neu generieren"}
          </Button>
          <Button 
            className="w-full bg-[#FF9258] hover:bg-[#FF9258]/90 text-white"
            onClick={onCreateAnnouncement}
            disabled={isGenerating}
          >
            {isGenerating ? "Generiere..." : "Ansage erstellen"}
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full bg-[#FFB485] hover:bg-[#FFB485]/90 text-white"
          onClick={onGeneratePreview}
          disabled={!formData.voice || !formData.text || loading || isGenerating}
        >
          {loading || isGenerating ? "Generiere..." : "Vorschau generieren"}
        </Button>
      )}
    </div>
  );
};

export default VoicemailAudioControls;
