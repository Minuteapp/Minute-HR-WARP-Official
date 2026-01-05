
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, MapPin, Target, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { useAiTimeTracking } from "@/hooks/time-tracking/useAiTimeTracking";
import { TimeEntry } from "@/types/time-tracking.types";

interface AiSuggestionsPanelProps {
  currentEntry?: TimeEntry | null;
  location?: string;
  onApplySuggestion?: (suggestion: any) => void;
}

const AiSuggestionsPanel = ({ 
  currentEntry, 
  location,
  onApplySuggestion 
}: AiSuggestionsPanelProps) => {
  const {
    suggestions,
    isAnalyzing,
    acceptSuggestion,
    rejectSuggestion,
    isHandlingSuggestion
  } = useAiTimeTracking(currentEntry);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'project_assignment':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'break_reminder':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'time_optimization':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'location_based':
        return <MapPin className="h-4 w-4 text-green-600" />;
      default:
        return <Brain className="h-4 w-4 text-purple-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'project_assignment': 'Projektzuordnung',
      'break_reminder': 'Pausenerinnerung',
      'time_optimization': 'Optimierung',
      'location_based': 'Standortbasiert'
    };
    return labels[type] || type;
  };

  if (suggestions.length === 0 && !isAnalyzing) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4 text-center">
          <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-gray-600">
            Keine KI-Vorschläge verfügbar
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Beginnen Sie mit der Zeiterfassung für intelligente Empfehlungen
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          KI-Assistent
          {isAnalyzing && (
            <div className="ml-auto">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-600">
              Analysiere aktuelle Situation...
            </div>
          </div>
        )}

        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSuggestionIcon(suggestion.type)}
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {suggestion.title}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs mt-1"
                  >
                    {getTypeLabel(suggestion.type)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}></div>
                <span className="text-xs text-gray-500">
                  {suggestion.confidence.toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {suggestion.description}
            </p>

            {!suggestion.is_accepted && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => {
                    acceptSuggestion(suggestion.id);
                    if (onApplySuggestion) {
                      onApplySuggestion(suggestion);
                    }
                  }}
                  disabled={isHandlingSuggestion}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Anwenden
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => rejectSuggestion(suggestion.id)}
                  disabled={isHandlingSuggestion}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Ablehnen
                </Button>
              </div>
            )}

            {suggestion.is_accepted === true && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-3 w-3" />
                Angewendet
              </div>
            )}

            {suggestion.is_accepted === false && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <XCircle className="h-3 w-3" />
                Abgelehnt
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AiSuggestionsPanel;
