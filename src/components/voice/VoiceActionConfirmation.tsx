import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Square, 
  Pause,
  Calendar,
  ListTodo,
  Search,
  Navigation,
  AlertCircle,
  Database,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIResponse {
  summary: string;
  explanation?: string;
  suggested_actions?: Array<{
    action: string;
    label: string;
    parameters: Record<string, any>;
    requires_confirmation: boolean;
  }>;
  data_sources?: string[];
  confidence?: 'high' | 'medium' | 'low';
  limitations?: string[];
  links_to_ui?: Array<{
    label: string;
    path: string;
  }>;
}

interface VoiceActionConfirmationProps {
  response: AIResponse;
  onConfirm: (action: string, parameters: Record<string, any>) => void;
  onCancel: () => void;
  isExecuting?: boolean;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'start_time_tracking':
    case 'start_time':
      return <Play className="h-4 w-4" />;
    case 'stop_time_tracking':
    case 'stop_time':
      return <Square className="h-4 w-4" />;
    case 'pause_time':
      return <Pause className="h-4 w-4" />;
    case 'log_time':
      return <Clock className="h-4 w-4" />;
    case 'navigate':
      return <Navigation className="h-4 w-4" />;
    case 'create_task':
      return <ListTodo className="h-4 w-4" />;
    case 'search':
      return <Search className="h-4 w-4" />;
    case 'request_vacation':
      return <Calendar className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

const getConfidenceColor = (confidence?: 'high' | 'medium' | 'low') => {
  switch (confidence) {
    case 'high':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const VoiceActionConfirmation: React.FC<VoiceActionConfirmationProps> = ({
  response,
  onConfirm,
  onCancel,
  isExecuting = false
}) => {
  const mainAction = response.suggested_actions?.[0];

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Summary */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-foreground">{response.summary}</p>
            {response.explanation && (
              <p className="text-sm text-muted-foreground mt-1">{response.explanation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Sources & Confidence */}
      <div className="flex flex-wrap gap-2">
        {response.data_sources && response.data_sources.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <Database className="h-3 w-3" />
            <span>Quellen: {response.data_sources.join(', ')}</span>
          </div>
        )}
        
        {response.confidence && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border",
            getConfidenceColor(response.confidence)
          )}>
            <span>Confidence: {response.confidence === 'high' ? 'Hoch' : response.confidence === 'medium' ? 'Mittel' : 'Niedrig'}</span>
          </div>
        )}
      </div>

      {/* Limitations */}
      {response.limitations && response.limitations.length > 0 && (
        <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-orange-800">Hinweise:</p>
              <ul className="text-xs text-orange-700 mt-1 space-y-0.5">
                {response.limitations.map((limitation, index) => (
                  <li key={index}>• {limitation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {mainAction && mainAction.requires_confirmation && (
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onConfirm(mainAction.action, mainAction.parameters)}
            disabled={isExecuting}
            className="flex-1 gap-2"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Wird ausgeführt...
              </>
            ) : (
              <>
                {getActionIcon(mainAction.action)}
                <CheckCircle className="h-4 w-4" />
                {mainAction.label || 'Bestätigen'}
              </>
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isExecuting}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      )}

      {/* Additional Actions */}
      {response.suggested_actions && response.suggested_actions.length > 1 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Weitere Aktionen:</p>
          <div className="flex flex-wrap gap-2">
            {response.suggested_actions.slice(1).map((action, index) => (
              <Button
                key={index}
                onClick={() => onConfirm(action.action, action.parameters)}
                variant="ghost"
                size="sm"
                disabled={isExecuting}
                className="gap-1.5 text-xs"
              >
                {getActionIcon(action.action)}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* UI Links */}
      {response.links_to_ui && response.links_to_ui.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Relevante Bereiche:</p>
          <div className="flex flex-wrap gap-2">
            {response.links_to_ui.map((link, index) => (
              <Button
                key={index}
                onClick={() => onConfirm('navigate', { path: link.path })}
                variant="link"
                size="sm"
                className="gap-1.5 text-xs h-auto p-0"
              >
                <Navigation className="h-3 w-3" />
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceActionConfirmation;
