// Settings-Driven Architecture (SDA) - Module Compliance Card
// Zeigt den Compliance-Status eines Moduls

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Settings2, 
  Lock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useEffectiveSettings } from '@/hooks/useEffectiveSettings';

interface ModuleComplianceCardProps {
  module: string;
  moduleName: string;
  icon: React.ElementType;
  expectedSettings: string[];
}

export const ModuleComplianceCard: React.FC<ModuleComplianceCardProps> = ({
  module,
  moduleName,
  icon: ModuleIcon,
  expectedSettings
}) => {
  const { settings, loading, error } = useEffectiveSettings(module);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-muted rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {moduleName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Fehler beim Laden: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const settingsKeys = Object.keys(settings);
  const configuredCount = settingsKeys.length;
  const expectedCount = expectedSettings.length;
  const coverage = expectedCount > 0 ? (configuredCount / expectedCount) * 100 : 0;

  const lockedSettings = Object.values(settings).filter(s => s.isLocked).length;
  const defaultSettings = Object.values(settings).filter(s => s.isDefault).length;
  const customizedSettings = configuredCount - defaultSettings;

  const getStatusColor = () => {
    if (coverage >= 100) return 'text-green-600';
    if (coverage >= 75) return 'text-blue-600';
    if (coverage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (coverage >= 100) return CheckCircle2;
    if (coverage >= 75) return TrendingUp;
    if (coverage >= 50) return AlertTriangle;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ModuleIcon className="h-5 w-5 text-primary" />
            {moduleName}
          </CardTitle>
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Konfigurationsabdeckung</span>
            <span className={`font-medium ${getStatusColor()}`}>{Math.round(coverage)}%</span>
          </div>
          <Progress value={coverage} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <Settings2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">{configuredCount}</div>
            <div className="text-xs text-muted-foreground">Gesamt</div>
          </div>
          <div className="p-2 rounded-lg bg-blue-50">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-semibold text-blue-600">{customizedSettings}</div>
            <div className="text-xs text-muted-foreground">Angepasst</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-50">
            <Lock className="h-4 w-4 mx-auto mb-1 text-amber-600" />
            <div className="text-lg font-semibold text-amber-600">{lockedSettings}</div>
            <div className="text-xs text-muted-foreground">Gesperrt</div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Einstellungen</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(settings).slice(0, 4).map(([key, setting]) => (
              <Badge 
                key={key} 
                variant="secondary" 
                className={`text-xs ${
                  setting.isLocked 
                    ? 'bg-amber-100 text-amber-700' 
                    : setting.isDefault 
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-blue-100 text-blue-700'
                }`}
              >
                {setting.isLocked && <Lock className="h-2 w-2 mr-1" />}
                {setting.definition.name.substring(0, 20)}
                {setting.definition.name.length > 20 && '...'}
              </Badge>
            ))}
            {Object.keys(settings).length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{Object.keys(settings).length - 4} weitere
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleComplianceCard;
