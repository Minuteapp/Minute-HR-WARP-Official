// Compliance Hub - Expandierbare Policy-Karte
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, ChevronDown, ChevronUp, Download, Users, Sparkles, Info } from 'lucide-react';

export interface Policy {
  id: string;
  name: string;
  status: 'active' | 'draft';
  category: string;
  aiSummary?: string;
  versionChanges?: string;
  version?: string;
  lastUpdated?: Date;
}

interface PolicyCardProps {
  policy: Policy;
  onDownload?: (policy: Policy) => void;
  onViewConfirmations?: (policy: Policy) => void;
  onRequestAIExplanation?: (policy: Policy) => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onDownload,
  onViewConfirmations,
  onRequestAIExplanation
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card">
        <CollapsibleTrigger asChild>
          <CardContent className="pt-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{policy.name}</p>
                  {policy.version && (
                    <p className="text-xs text-muted-foreground">Version {policy.version}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={policy.status === 'active' ? 'default' : 'secondary'}
                  className={policy.status === 'active' 
                    ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400'
                  }
                >
                  {policy.status === 'active' ? 'Aktiv' : 'Entwurf'}
                </Badge>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="pt-4 space-y-4">
              {/* KI-Zusammenfassung */}
              {policy.aiSummary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">KI-Zusammenfassung:</span> {policy.aiSummary}
                    <Button variant="link" className="h-auto p-0 ml-1 text-purple-600">
                      Anzeigen
                    </Button>
                  </p>
                </div>
              )}
              
              {/* Versionsänderungen */}
              {policy.versionChanges && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Änderungen zur Vorgängerversion:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {policy.versionChanges}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => onDownload?.(policy)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF herunterladen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewConfirmations?.(policy)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Bestätigungen ansehen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRequestAIExplanation?.(policy)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  KI-Erklärung anfordern
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
