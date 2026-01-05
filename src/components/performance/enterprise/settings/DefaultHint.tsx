import React from 'react';
import { Info } from 'lucide-react';

interface DefaultHintProps {
  text?: string;
}

export const DefaultHint: React.FC<DefaultHintProps> = ({ 
  text = "80/20 Default: Diese Einstellung ist bereits optimal für die meisten Unternehmen." 
}) => {
  return (
    <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
};
