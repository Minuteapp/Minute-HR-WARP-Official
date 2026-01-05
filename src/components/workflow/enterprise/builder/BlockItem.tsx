import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface BlockItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  module?: string;
  onClick: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  icon: Icon,
  label,
  description,
  module,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{label}</span>
          {module && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {module}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
};
