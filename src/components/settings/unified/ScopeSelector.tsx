import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, UsersRound, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SettingsScope, SCOPE_PRIORITY } from '@/types/unified-settings';
import { cn } from '@/lib/utils';

interface ScopeSelectorProps {
  currentScope: SettingsScope;
  scopeId?: string;
  onScopeChange: (scope: SettingsScope, scopeId?: string) => void;
  availableScopes?: {
    standorte?: { id: string; name: string }[];
    abteilungen?: { id: string; name: string }[];
    teams?: { id: string; name: string }[];
  };
  showPriorityHint?: boolean;
  disabled?: boolean;
}

const SCOPE_CONFIG: Record<SettingsScope, { 
  icon: typeof Building2; 
  label: string; 
  description: string;
}> = {
  global: {
    icon: Building2,
    label: 'Gesamtes Unternehmen',
    description: 'Gilt für alle Standorte, Abteilungen und Teams'
  },
  standort: {
    icon: MapPin,
    label: 'Standort',
    description: 'Gilt für einen bestimmten Standort'
  },
  abteilung: {
    icon: Users,
    label: 'Abteilung',
    description: 'Gilt für eine bestimmte Abteilung'
  },
  team: {
    icon: UsersRound,
    label: 'Team',
    description: 'Gilt für ein bestimmtes Team'
  }
};

export function ScopeSelector({
  currentScope,
  scopeId,
  onScopeChange,
  availableScopes,
  showPriorityHint = true,
  disabled = false
}: ScopeSelectorProps) {
  const CurrentIcon = SCOPE_CONFIG[currentScope].icon;

  const getSubItems = () => {
    switch (currentScope) {
      case 'standort':
        return availableScopes?.standorte ?? [];
      case 'abteilung':
        return availableScopes?.abteilungen ?? [];
      case 'team':
        return availableScopes?.teams ?? [];
      default:
        return [];
    }
  };

  const subItems = getSubItems();
  const showSubSelect = currentScope !== 'global' && subItems.length > 0;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrentIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Gültigkeitsbereich</span>
            </div>
            {showPriorityHint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium mb-1">Prioritätsregeln:</p>
                  <p className="text-xs">Team &gt; Abteilung &gt; Standort &gt; Global</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Spezifischere Einstellungen überschreiben allgemeinere.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Scope Selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={currentScope}
              onValueChange={(value) => onScopeChange(value as SettingsScope)}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SCOPE_CONFIG).map(([scope, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={scope} value={scope}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Sub-Item Selector */}
            {showSubSelect && (
              <Select
                value={scopeId}
                onValueChange={(value) => onScopeChange(currentScope, value)}
                disabled={disabled}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={`${SCOPE_CONFIG[currentScope].label} auswählen...`} />
                </SelectTrigger>
                <SelectContent>
                  {subItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Current Scope Description */}
          <p className="text-xs text-muted-foreground">
            {SCOPE_CONFIG[currentScope].description}
          </p>

          {/* Priority Badge */}
          {showPriorityHint && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Priorität:</span>
              <div className="flex gap-1">
                {(['global', 'standort', 'abteilung', 'team'] as SettingsScope[]).map((scope) => (
                  <Badge
                    key={scope}
                    variant={scope === currentScope ? 'default' : 'outline'}
                    className={cn(
                      "text-xs",
                      scope === currentScope && "bg-primary"
                    )}
                  >
                    {SCOPE_PRIORITY[scope]}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
