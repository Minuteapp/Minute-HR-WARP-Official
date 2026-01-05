// Settings-Driven Architecture (SDA) - Setting Indicator Komponente
// Zeigt die Quelle und den Status einer Einstellung an

import React from 'react';
import { Info, Lock, ArrowDown, Globe, Building2, MapPin, Users, User, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EffectiveSetting, SettingScopeLevel } from '@/types/settings-driven';

interface SettingIndicatorProps {
  setting: EffectiveSetting | null;
  showValue?: boolean;
  showSource?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SCOPE_ICONS: Record<SettingScopeLevel, React.ElementType> = {
  global: Globe,
  company: Building2,
  location: MapPin,
  department: Users,
  team: Users,
  role: Shield,
  user: User
};

const SCOPE_NAMES: Record<SettingScopeLevel, string> = {
  global: 'Global',
  company: 'Gesellschaft',
  location: 'Standort',
  department: 'Abteilung',
  team: 'Team',
  role: 'Rolle',
  user: 'Benutzer'
};

const SCOPE_COLORS: Record<SettingScopeLevel, string> = {
  global: 'bg-slate-100 text-slate-700',
  company: 'bg-blue-100 text-blue-700',
  location: 'bg-green-100 text-green-700',
  department: 'bg-purple-100 text-purple-700',
  team: 'bg-orange-100 text-orange-700',
  role: 'bg-pink-100 text-pink-700',
  user: 'bg-cyan-100 text-cyan-700'
};

export const SettingIndicator: React.FC<SettingIndicatorProps> = ({
  setting,
  showValue = false,
  showSource = true,
  size = 'sm',
  className = ''
}) => {
  if (!setting) {
    return null;
  }

  const { source, isLocked, isDefault, value, definition, inheritedFrom } = setting;
  const ScopeIcon = SCOPE_ICONS[source.level];
  const scopeName = SCOPE_NAMES[source.level];
  const scopeColor = SCOPE_COLORS[source.level];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const formatValue = (val: any): string => {
    if (typeof val === 'boolean') {
      return val ? 'Ja' : 'Nein';
    }
    if (typeof val === 'number') {
      return val.toString();
    }
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return String(val);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
            {isLocked && (
              <Lock className={`${iconSizes[size]} text-amber-500`} />
            )}
            {showSource && (
              <Badge variant="secondary" className={`${scopeColor} ${sizeClasses[size]} px-1.5 py-0.5`}>
                <ScopeIcon className={`${iconSizes[size]} mr-1`} />
                {scopeName}
                {source.entityName && `: ${source.entityName}`}
              </Badge>
            )}
            {showValue && (
              <span className="text-muted-foreground">
                = {formatValue(value)}
              </span>
            )}
            <Info className={`${iconSizes[size]} text-muted-foreground cursor-help`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div className="font-medium">{definition.name}</div>
            <p className="text-xs text-muted-foreground">{definition.description}</p>
            <div className="border-t pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktueller Wert:</span>
                <span className="font-medium">{formatValue(value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Definiert auf:</span>
                <span className="font-medium">{scopeName}</span>
              </div>
              {isDefault && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-blue-600">Standardwert</span>
                </div>
              )}
              {isLocked && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-amber-600 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Gesperrt
                  </span>
                </div>
              )}
              {inheritedFrom && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Geerbt von:</span>
                  <span className="flex items-center gap-1">
                    <ArrowDown className="h-3 w-3" />
                    {SCOPE_NAMES[inheritedFrom.level]}
                  </span>
                </div>
              )}
              {definition.affectedFeatures && definition.affectedFeatures.length > 0 && (
                <div className="pt-1">
                  <span className="text-muted-foreground">Betroffene Funktionen:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {definition.affectedFeatures.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SettingIndicator;
