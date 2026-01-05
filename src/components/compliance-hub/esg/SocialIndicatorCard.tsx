import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SocialIndicatorCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  target: string;
  showWarning?: boolean;
  iconBg?: string;
  iconColor?: string;
}

export const SocialIndicatorCard: React.FC<SocialIndicatorCardProps> = ({ 
  icon: Icon,
  title,
  value,
  target,
  showWarning = false,
  iconBg = 'bg-muted',
  iconColor = 'text-muted-foreground'
}) => {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{target}</p>
            </div>
          </div>
          {showWarning && (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
