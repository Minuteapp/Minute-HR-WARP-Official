import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface VoiceAssistantButtonProps {
  isListening: boolean;
  toggleListening: () => void;
  currentMethod?: 'web-speech' | 'whisper' | null;
  className?: string;
}

const VoiceAssistantButton = ({ 
  isListening, 
  toggleListening,
  currentMethod = null,
  className = ""
}: VoiceAssistantButtonProps) => {
  const getMethodBadge = () => {
    if (!currentMethod || !isListening) return null;
    
    return (
      <Badge 
        variant="secondary" 
        className={`absolute -top-1 -right-1 text-[10px] px-1.5 py-0 ${
          currentMethod === 'web-speech' 
            ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
            : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
        }`}
      >
        {currentMethod === 'web-speech' ? 'Web' : 'AI'}
      </Badge>
    );
  };

  const getTooltipText = () => {
    if (isListening) {
      const methodName = currentMethod === 'web-speech' ? 'Web Speech API' : 'Whisper API';
      return `Spracherkennung stoppen (${methodName})`;
    }
    return 'Sprachbefehle aktivieren';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleListening}
              className={`${isListening ? 'animate-pulse' : ''} ${className}`}
              aria-label={getTooltipText()}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            {getMethodBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoiceAssistantButton;
