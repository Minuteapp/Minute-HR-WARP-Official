import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ isOpen, onClick }) => {
  return (
    <Button
      onClick={() => {
        console.log('💬 FloatingChatButton geklickt, isOpen:', isOpen);
        onClick();
      }}
      className={cn(
        "fixed bottom-6 right-6 z-[100] h-14 w-14 rounded-full shadow-lg transition-all duration-300",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "hover:scale-105 active:scale-95"
      )}
      size="icon"
      aria-label={isOpen ? "Chat schließen" : "Minute Companion öffnen"}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
};

export default FloatingChatButton;
