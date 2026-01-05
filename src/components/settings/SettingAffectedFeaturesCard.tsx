// SettingAffectedFeaturesCard - Zeigt welche Features von einer Einstellung betroffen sind
// Implementiert Regel 4 der Settings-Driven Architecture

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Zap, Shield, Bot, Workflow, Monitor, FileText, AlertTriangle, Scale } from 'lucide-react';
import { useSettingAffectedFeatures } from '@/hooks/useSettingAffectedFeatures';

interface SettingAffectedFeaturesCardProps {
  // Modus 1: Modul + Key für automatisches Laden
  module?: string;
  settingKey?: string;
  // Modus 2: Manuelle Daten (Fallback)
  settingName?: string;
  affectedFeatures?: string[];
  enforcement?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  legalReference?: string;
  // Anzeige-Optionen
  showCompact?: boolean;
  showLegalRef?: boolean;
  className?: string;
}

const getEnforcementIcon = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'ui': return <Monitor className="h-3 w-3" />;
    case 'api': return <Zap className="h-3 w-3" />;
    case 'automation': return <Workflow className="h-3 w-3" />;
    case 'ai': case 'chatbot': return <Bot className="h-3 w-3" />;
    case 'report': return <FileText className="h-3 w-3" />;
    default: return <Shield className="h-3 w-3" />;
  }
};

const getEnforcementLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    'ui': 'Benutzeroberfläche',
    'api': 'API-Endpunkte',
    'automation': 'Automatisierungen',
    'ai': 'KI-Assistent',
    'chatbot': 'Chatbot',
    'report': 'Reports & Analytics',
    'workflow': 'Workflows'
  };
  return labels[channel.toLowerCase()] || channel;
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical': return 'bg-destructive text-destructive-foreground';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRiskLabel = (level: string): string => {
  const labels: Record<string, string> = {
    'critical': 'Kritisch',
    'high': 'Hoch',
    'medium': 'Mittel',
    'low': 'Niedrig'
  };
  return labels[level] || level;
};

export const SettingAffectedFeaturesCard: React.FC<SettingAffectedFeaturesCardProps> = ({
  module,
  settingKey,
  settingName,
  affectedFeatures: manualFeatures,
  enforcement: manualEnforcement,
  riskLevel: manualRiskLevel,
  legalReference: manualLegalRef,
  showCompact = false,
  showLegalRef = false,
  className = ''
}) => {
  // Automatisches Laden wenn module + settingKey vorhanden
  const { getAffectedFeatures, getEnforcement, getRiskLevel, getDefinition, loading } = 
    useSettingAffectedFeatures(module || '');

  // Entscheide ob wir automatisch geladene oder manuelle Daten verwenden
  const definition = settingKey ? getDefinition(settingKey) : null;
  
  const affectedFeatures = definition?.affectedFeatures || manualFeatures || [];
  const enforcement = definition?.enforcement || manualEnforcement || ['ui'];
  const riskLevel = definition?.riskLevel || manualRiskLevel || 'low';
  const legalReference = definition?.legalReference || manualLegalRef;
  const displayName = definition?.name || settingName || settingKey || 'Einstellung';

  // Nichts anzeigen wenn keine Features vorhanden
  if (affectedFeatures.length === 0 && !loading) {
    return null;
  }

  // Kompakt-Modus: Nur Icon mit Tooltip
  if (showCompact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1 cursor-help text-muted-foreground hover:text-foreground transition-colors ${className}`}>
              <Info className="h-3.5 w-3.5" />
              <span className="text-xs">
                {loading ? '...' : `${affectedFeatures.length} Features`}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3" side="right">
            <p className="font-medium mb-2 text-sm">Diese Einstellung beeinflusst:</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {affectedFeatures.map((feature, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Durchsetzung:</span>
              {enforcement.map((channel, idx) => (
                <span key={idx} className="flex items-center gap-0.5 text-xs">
                  {getEnforcementIcon(channel)}
                </span>
              ))}
            </div>
            {riskLevel !== 'low' && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600">Risiko: {getRiskLabel(riskLevel)}</span>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Voller Modus: Card mit Details
  return (
    <Card className={`border-dashed bg-muted/30 ${className}`}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span>Diese Einstellung beeinflusst</span>
          {riskLevel !== 'low' && (
            <Badge className={getRiskColor(riskLevel)} variant="secondary">
              {getRiskLabel(riskLevel)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Lädt...</div>
        ) : (
          <div className="space-y-3">
            {/* Betroffene Features */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Betroffene Module & Funktionen:</p>
              <div className="flex flex-wrap gap-1.5">
                {affectedFeatures.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Enforcement Channels */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Wird durchgesetzt in:</p>
              <div className="flex flex-wrap gap-2">
                {enforcement.map((channel, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs cursor-help">
                          {getEnforcementIcon(channel)}
                          {channel.toUpperCase()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getEnforcementLabel(channel)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* Gesetzliche Referenz */}
            {showLegalRef && legalReference && (
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <Scale className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Rechtliche Grundlage:</p>
                  <p className="text-xs font-medium">{legalReference}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Kompakte Inline-Version für Switches
 */
export const SettingAffectedFeaturesInline: React.FC<{
  module: string;
  settingKey: string;
  className?: string;
}> = ({ module, settingKey, className }) => {
  return (
    <SettingAffectedFeaturesCard
      module={module}
      settingKey={settingKey}
      showCompact
      className={className}
    />
  );
};

export default SettingAffectedFeaturesCard;
