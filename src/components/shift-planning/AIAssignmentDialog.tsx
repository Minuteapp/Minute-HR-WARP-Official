
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Zap, AlertCircle } from "lucide-react";

interface AIAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  onSuccess: () => void;
}

const AIAssignmentDialog = ({ isOpen, onOpenChange, currentDate, onSuccess }: AIAssignmentDialogProps) => {
  const [planningMethod, setPlanningMethod] = useState("balanced");
  const [planningPeriod, setPlanningPeriod] = useState("month");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fairnessWeight, setFairnessWeight] = useState([50]);
  const [considerPreferences, setConsiderPreferences] = useState(true);
  const [respectQualifications, setRespectQualifications] = useState(true);
  const [activeTab, setActiveTab] = useState("simple");

  const handlePlanGeneration = async () => {
    setIsProcessing(true);
    
    // Hier würde die eigentliche KI-Planung stattfinden
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            KI-Schichtplanung
          </DialogTitle>
          <DialogDescription>
            Lassen Sie die KI einen optimalen Schichtplan basierend auf Ihrer Konfiguration erstellen.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Einfach</TabsTrigger>
            <TabsTrigger value="advanced">Erweitert</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Planungszeitraum</h3>
                <RadioGroup 
                  defaultValue={planningPeriod} 
                  onValueChange={setPlanningPeriod}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="week" id="week" />
                    <Label htmlFor="week">Woche</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="month" />
                    <Label htmlFor="month">Monat</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Planungsmethode</h3>
                <RadioGroup 
                  defaultValue={planningMethod} 
                  onValueChange={setPlanningMethod}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced">Ausgewogene Verteilung</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="optimal" id="optimal" />
                    <Label htmlFor="optimal">Qualifikationsoptimierung</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preference" id="preference" />
                    <Label htmlFor="preference">Präferenzorientiert</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 py-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Ausgewogenheit vs. Effizienz</Label>
                  <span className="text-sm text-muted-foreground">{fairnessWeight}%</span>
                </div>
                <Slider
                  value={fairnessWeight}
                  onValueChange={setFairnessWeight}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Höhere Werte priorisieren gleichmäßige Verteilung, niedrigere Werte priorisieren Effizienz.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mitarbeiterpräferenzen berücksichtigen</Label>
                  <p className="text-xs text-muted-foreground">
                    Berücksichtigt Wunschdienste der Mitarbeiter
                  </p>
                </div>
                <Switch 
                  checked={considerPreferences}
                  onCheckedChange={setConsiderPreferences}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Qualifikationsanforderungen beachten</Label>
                  <p className="text-xs text-muted-foreground">
                    Stellt sicher, dass alle notwendigen Qualifikationen abgedeckt sind
                  </p>
                </div>
                <Switch 
                  checked={respectQualifications}
                  onCheckedChange={setRespectQualifications}
                />
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-700">Hinweis</h4>
                    <p className="text-xs text-amber-600 mt-1">
                      Erweiterte Einstellungen können die Generierungszeit erhöhen und zu komplexeren Ergebnissen führen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handlePlanGeneration}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Generiere Plan...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Plan generieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssignmentDialog;
