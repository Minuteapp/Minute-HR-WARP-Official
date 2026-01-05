import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  typingUsers: string[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} schreibt...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} und ${typingUsers[1]} schreiben...`;
    } else {
      return `${typingUsers[0]} und ${typingUsers.length - 1} weitere schreiben...`;
    }
  };

  return (
    <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}
