import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export const ChatInput = ({ input, setInput, onSendMessage, isLoading }: ChatInputProps) => {
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage();
  };

  return (
    <div className="p-3 pt-0 border-t border-primary/10 mt-auto">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Schreiben Sie Ihre Nachricht..."
          onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
          disabled={isLoading}
          className="flex-1 border-primary/20 focus-visible:ring-primary/30 shadow-sm focus-visible:border-primary/40"
        />
        <Button 
          onClick={handleSend} 
          disabled={isLoading} 
          className="shadow hover:shadow-md transition-shadow bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
