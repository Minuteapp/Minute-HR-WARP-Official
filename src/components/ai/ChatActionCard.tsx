import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Shield, 
  Settings,
  FileText,
  ArrowRight
} from 'lucide-react';
import { ChatAction, ChatContext } from '@/types/chatbot-actions';
import { cn } from '@/lib/utils';

interface ChatActionCardProps {
  shortAnswer: string;
  primaryAction: ChatAction;
  secondaryAction?: ChatAction;
  context?: ChatContext;
  className?: string;
}

export const ChatActionCard = ({
  shortAnswer,
  primaryAction,
  secondaryAction,
  context,
  className
}: ChatActionCardProps) => {
  const navigate = useNavigate();
  const [isContextOpen, setIsContextOpen] = useState(false);

  const handleAction = (action: ChatAction) => {
    if (action.requiresConfirmation) {
      // Für Aktionen die Bestätigung brauchen, zur UI navigieren
      navigate(action.deepLink);
    } else {
      navigate(action.deepLink);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'navigate': return <ArrowRight className="h-4 w-4" />;
      case 'form': return <FileText className="h-4 w-4" />;
      case 'export': return <ExternalLink className="h-4 w-4" />;
      default: return <ArrowRight className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("border-primary/20 bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Kurzantwort */}
        <p className="text-sm text-foreground leading-relaxed">
          {shortAnswer}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Primäre Aktion */}
          <Button 
            size="sm" 
            onClick={() => handleAction(primaryAction)}
            className="gap-2"
          >
            {getActionIcon(primaryAction.type)}
            {primaryAction.label}
          </Button>

          {/* Sekundäre Aktion */}
          {secondaryAction && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAction(secondaryAction)}
              className="gap-2"
            >
              {getActionIcon(secondaryAction.type)}
              {secondaryAction.label}
            </Button>
          )}
        </div>

        {/* Kontext - aufklappbar */}
        {context && (
          <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                {isContextOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Warum?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="rounded-md bg-muted/50 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database className="h-3 w-3" />
                  <span>Datenquelle:</span>
                  <span className="text-foreground font-medium">{context.dataSource}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Berechtigung:</span>
                  <span className="text-foreground font-medium">{context.permission}</span>
                </div>
                {context.setting && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    <span>Einstellung:</span>
                    <span className="text-foreground font-medium">{context.setting}</span>
                  </div>
                )}
                {context.legalInfo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>Rechtlich:</span>
                    <span className="text-foreground font-medium">{context.legalInfo}</span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
