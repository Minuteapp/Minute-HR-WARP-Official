
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Check, X, Sparkles, RefreshCw } from "lucide-react";
import { TravelAiSuggestion } from "@/types/business-travel";

interface AiSuggestionsPanelProps {
  suggestions: TravelAiSuggestion[];
  isLoading: boolean;
  isGenerating: boolean;
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
  onGenerate: (destination: string, purpose: string) => void;
  destination?: string;
  purpose?: string;
}

export const AiSuggestionsPanel = ({ 
  suggestions, 
  isLoading, 
  isGenerating,
  onAccept, 
  onReject, 
  onGenerate,
  destination = '',
  purpose = ''
}: AiSuggestionsPanelProps) => {
  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'flight': return '✈️';
      case 'restaurant': return '🍽️';
      case 'transport': return '🚗';
      case 'activity': return '🎯';
      default: return '💡';
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel': return 'Hotel';
      case 'flight': return 'Flug';
      case 'restaurant': return 'Restaurant';
      case 'transport': return 'Transport';
      case 'activity': return 'Aktivität';
      default: return 'Vorschlag';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Reisevorschläge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Reisevorschläge
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onGenerate(destination, purpose)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Neue Vorschläge
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Vorschläge verfügbar</h3>
            <p className="text-muted-foreground mb-4">
              Generieren Sie AI-basierte Vorschläge für Ihre Reise.
            </p>
            <Button onClick={() => onGenerate(destination, purpose)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Vorschläge generieren
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id} 
                className={`border rounded-lg p-4 ${suggestion.is_accepted ? 'bg-green-50 border-green-200' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getSuggestionTypeIcon(suggestion.suggestion_type)}</span>
                      <Badge variant="secondary">
                        {getSuggestionTypeLabel(suggestion.suggestion_type)}
                      </Badge>
                      {suggestion.is_accepted && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Akzeptiert
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-1">{suggestion.title}</h4>
                    {suggestion.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      {suggestion.price && (
                        <span className="font-medium">
                          {suggestion.price} {suggestion.currency || 'EUR'}
                        </span>
                      )}
                      
                      {suggestion.provider && (
                        <span className="text-muted-foreground">
                          von {suggestion.provider}
                        </span>
                      )}
                      
                      {suggestion.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{suggestion.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {suggestion.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(suggestion.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {!suggestion.is_accepted ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReject(suggestion.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onAccept(suggestion.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(suggestion.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rückgängig
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
