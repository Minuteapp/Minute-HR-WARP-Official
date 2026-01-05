import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Info, 
  AlertTriangle,
  Link2
} from 'lucide-react';
import { SettingsContainer, SettingDefinition, hasModuleDependencies } from '@/types/unified-settings';
import { cn } from '@/lib/utils';

interface UnifiedSettingsContainerProps {
  container: SettingsContainer;
  standardSettings: SettingDefinition[];
  advancedSettings: SettingDefinition[];
  showAdvanced: boolean;
  isExpanded: boolean;
  onToggleAdvanced: () => void;
  onToggleExpand: () => void;
  onReset: () => void;
  getValue: (key: string, defaultValue: unknown) => unknown;
  onChange: (setting: SettingDefinition, value: unknown) => void;
  isModified: (key: string) => boolean;
}

export function UnifiedSettingsContainer({
  container,
  standardSettings,
  advancedSettings,
  showAdvanced,
  isExpanded,
  onToggleAdvanced,
  onToggleExpand,
  onReset,
  getValue,
  onChange,
  isModified
}: UnifiedSettingsContainerProps) {
  const { meta } = container;
  const Icon = meta.icon;
  const hasAdvanced = advancedSettings.length > 0;

  const renderSettingControl = (setting: SettingDefinition) => {
    const value = getValue(setting.key, setting.defaultValue);
    const modified = isModified(setting.key);

    switch (setting.type) {
      case 'switch':
        return (
          <Switch
            checked={value as boolean}
            onCheckedChange={(checked) => onChange(setting, checked)}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(v) => onChange(setting, v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'input':
        return (
          <Input
            value={value as string}
            onChange={(e) => onChange(setting, e.target.value)}
            className="w-48"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value as number}
            min={setting.validation?.min}
            max={setting.validation?.max}
            onChange={(e) => onChange(setting, Number(e.target.value))}
            className="w-24"
          />
        );
      default:
        return null;
    }
  };

  const renderSetting = (setting: SettingDefinition) => {
    const hasDependencies = hasModuleDependencies(setting);
    const modified = isModified(setting.key);

    return (
      <div
        key={setting.key}
        className={cn(
          "flex items-center justify-between py-3 px-2 rounded-lg transition-colors",
          modified && "bg-primary/5"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{setting.label}</span>
              {setting.isRecommended && (
                <Badge variant="secondary" className="text-xs">
                  Empfohlen
                </Badge>
              )}
              {modified && (
                <Badge variant="outline" className="text-xs text-primary">
                  Geändert
                </Badge>
              )}
            </div>
            {setting.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {setting.description}
              </p>
            )}
          </div>

          {/* Tooltip for complex options */}
          {setting.tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>{setting.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2">
          {renderSettingControl(setting)}
        </div>
      </div>
    );
  };

  // Collect all affected modules from settings
  const allAffectedModules = [...new Set(
    [...standardSettings, ...advancedSettings]
      .flatMap(s => s.affectedModules ?? [])
  )];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{meta.title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {meta.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="h-8 w-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Auf Standard zurücksetzen</p>
              </TooltipContent>
            </Tooltip>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded !== false}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Standard Settings */}
            <div className="space-y-1">
              {standardSettings.map(renderSetting)}
            </div>

            {/* Advanced Settings Toggle */}
            {hasAdvanced && (
              <Collapsible open={showAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleAdvanced}
                    className="w-full mt-4 text-muted-foreground hover:text-foreground"
                  >
                    {showAdvanced ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Erweiterte Optionen ausblenden
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Erweiterte Optionen anzeigen ({advancedSettings.length})
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 pt-4 border-t border-dashed space-y-1">
                    {advancedSettings.map(renderSetting)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Dependencies Display */}
            {allAffectedModules.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-start gap-2 text-xs text-muted-foreground">
                <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Beeinflusst: </span>
                  {allAffectedModules.join(', ')}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
