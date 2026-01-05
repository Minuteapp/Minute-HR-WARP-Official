
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, FileText, Mic, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantPanelProps {
  onClose: () => void;
}

const AIAssistantPanel = ({ onClose }: AIAssistantPanelProps) => {
  const { toast } = useToast();
  
  const handleFeatureClick = (feature: string) => {
    toast({
      title: `${feature} ausgewählt`,
      description: `Der ${feature} wird geladen...`
    });
  };

  return (
    <Card className="shadow-lg border-primary/20 hover:shadow-xl transition-shadow rounded-xl p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">KI-Assistent</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 shadow-sm hover-card-effect">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <Bot className="h-4 w-4" />
            Chat-Assistent
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Intelligenter Assistent für Ihre Chat-Konversationen
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full shadow-sm btn-enhanced"
            onClick={() => handleFeatureClick('Chat-Assistent')}
          >
            Starten
          </Button>
        </div>
        
        <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 shadow-sm hover-card-effect">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <FileText className="h-4 w-4 text-blue-600" />
            Dokument-Analyse
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Analysiert und fasst Dokumente in Sekundenschnelle zusammen
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-blue-600 border-blue-500/20 shadow-sm btn-enhanced"
            onClick={() => handleFeatureClick('Dokument-Analyse')}
          >
            Dokument hochladen
          </Button>
        </div>
        
        <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/10 shadow-sm hover-card-effect">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <Mic className="h-4 w-4 text-green-600" />
            Sprach-Assistent
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Nimmt Sprache auf und wandelt sie in Text um oder gibt Antworten
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-green-600 border-green-500/20 shadow-sm btn-enhanced"
            onClick={() => handleFeatureClick('Sprach-Assistent')}
          >
            Sprachaufnahme starten
          </Button>
        </div>
        
        <div className="bg-orange-500/5 p-4 rounded-lg border border-orange-500/10 shadow-sm hover-card-effect">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            Meeting-Zusammenfassung
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Erstellt automatisch Zusammenfassungen aus Ihren Meetings
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-orange-600 border-orange-500/20 shadow-sm btn-enhanced"
            onClick={() => handleFeatureClick('Meeting-Zusammenfassung')}
          >
            Meeting aufzeichnen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantPanel;
