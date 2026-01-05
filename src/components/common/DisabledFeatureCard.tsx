// Settings-Driven Architecture (SDA) - Disabled Feature Card
// Zeigt an, wenn ein Feature durch Einstellungen deaktiviert ist

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Settings, Lock, Info } from 'lucide-react';

interface DisabledFeatureCardProps {
  /** Der Grund warum das Feature deaktiviert ist */
  reason: string;
  /** Optional: Pfad zu den Einstellungen um das Feature zu aktivieren */
  settingsPath?: string;
  /** Optional: Name des Settings-Keys für Admin-Hinweis */
  settingKey?: string;
  /** Optional: Titel der Karte */
  title?: string;
  /** Optional: Icon-Variante */
  variant?: 'warning' | 'info' | 'locked';
  /** Optional: Kompakte Darstellung */
  compact?: boolean;
  /** Optional: Zusätzliche Klassen */
  className?: string;
}

export const DisabledFeatureCard: React.FC<DisabledFeatureCardProps> = ({
  reason,
  settingsPath,
  settingKey,
  title = 'Funktion nicht verfügbar',
  variant = 'warning',
  compact = false,
  className = ''
}) => {
  const navigate = useNavigate();
  
  const iconMap = {
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    locked: <Lock className="h-5 w-5 text-muted-foreground" />
  };
  
  const bgMap = {
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
    locked: 'border-muted bg-muted/50'
  };
  
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${bgMap[variant]} ${className}`}>
        {iconMap[variant]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{reason}</p>
        </div>
        {settingsPath && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(settingsPath)}
            className="shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card className={`${bgMap[variant]} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {iconMap[variant]}
          <div className="flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1">{reason}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {settingKey && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {settingKey}
              </Badge>
              <span className="text-xs text-muted-foreground">
                = deaktiviert
              </span>
            </div>
          )}
          
          {settingsPath && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(settingsPath)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen öffnen
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground">
            Wenden Sie sich an Ihren Administrator, um diese Funktion zu aktivieren.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Inline-Variante für kleinere Hinweise
 */
export const DisabledFeatureBadge: React.FC<{
  reason: string;
  className?: string;
}> = ({ reason, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-muted-foreground text-xs ${className}`}>
      <Lock className="h-3 w-3" />
      <span className="truncate max-w-[200px]">{reason}</span>
    </div>
  );
};

export default DisabledFeatureCard;