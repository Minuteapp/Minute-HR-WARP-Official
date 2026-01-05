
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArbeitszeitModell {
  id: string;
  name: string;
  beschreibung: string | null;
  regel_json: any;
  created_at: string;
  updated_at: string;
}

const WorktimeModels = () => {
  const { toast } = useToast();
  const [models, setModels] = useState<ArbeitszeitModell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentModel, setCurrentModel] = useState<ArbeitszeitModell | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    beschreibung: "",
    regelJson: "{}"
  });
  
  // Lade Arbeitszeitmodelle
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('arbeitszeit_modelle')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setModels(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Arbeitszeitmodelle:', error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Die Arbeitszeitmodelle konnten nicht geladen werden.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModels();
  }, [toast]);
  
  const handleCreate = async () => {
    setIsCreating(true);
    
    try {
      // Validierung
      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Bitte geben Sie einen Namen für das Arbeitszeitmodell ein.",
        });
        return;
      }
      
      // Prüfe, ob regelJson gültiges JSON ist
      let regelJsonObj;
      try {
        regelJsonObj = JSON.parse(formData.regelJson);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Die Regeln enthalten ungültiges JSON.",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('arbeitszeit_modelle')
        .insert({
          name: formData.name,
          beschreibung: formData.beschreibung || null,
          regel_json: regelJsonObj
        })
        .select();
      
      if (error) throw error;
      
      // Aktualisiere die Liste
      setModels(prevModels => [...prevModels, data[0]]);
      
      toast({
        title: "Erfolg",
        description: "Das Arbeitszeitmodell wurde erfolgreich erstellt.",
      });
      
      // Dialog schließen und Formular zurücksetzen
      setShowDialog(false);
      setFormData({
        name: "",
        beschreibung: "",
        regelJson: "{}"
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Arbeitszeitmodells:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Das Arbeitszeitmodell konnte nicht erstellt werden.",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!currentModel) return;
    
    setIsCreating(true);
    
    try {
      // Validierung
      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Bitte geben Sie einen Namen für das Arbeitszeitmodell ein.",
        });
        return;
      }
      
      // Prüfe, ob regelJson gültiges JSON ist
      let regelJsonObj;
      try {
        regelJsonObj = JSON.parse(formData.regelJson);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Die Regeln enthalten ungültiges JSON.",
        });
        return;
      }
      
      const { error } = await supabase
        .from('arbeitszeit_modelle')
        .update({
          name: formData.name,
          beschreibung: formData.beschreibung || null,
          regel_json: regelJsonObj
        })
        .eq('id', currentModel.id);
      
      if (error) throw error;
      
      // Aktualisiere die Liste
      setModels(prevModels => 
        prevModels.map(model => 
          model.id === currentModel.id 
            ? { 
                ...model, 
                name: formData.name, 
                beschreibung: formData.beschreibung, 
                regel_json: regelJsonObj 
              } 
            : model
        )
      );
      
      toast({
        title: "Erfolg",
        description: "Das Arbeitszeitmodell wurde erfolgreich aktualisiert.",
      });
      
      // Dialog schließen und Formular zurücksetzen
      setShowDialog(false);
      setCurrentModel(null);
      setFormData({
        name: "",
        beschreibung: "",
        regelJson: "{}"
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Arbeitszeitmodells:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Das Arbeitszeitmodell konnte nicht aktualisiert werden.",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleEdit = (model: ArbeitszeitModell) => {
    setCurrentModel(model);
    setFormData({
      name: model.name,
      beschreibung: model.beschreibung || "",
      regelJson: JSON.stringify(model.regel_json, null, 2)
    });
    setShowDialog(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Sind Sie sicher, dass Sie dieses Arbeitszeitmodell löschen möchten?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('arbeitszeit_modelle')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Aktualisiere die Liste
      setModels(prevModels => prevModels.filter(model => model.id !== id));
      
      toast({
        title: "Erfolg",
        description: "Das Arbeitszeitmodell wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Arbeitszeitmodells:', error);
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Das Arbeitszeitmodell konnte nicht gelöscht werden. Möglicherweise wird es noch von Mitarbeitern verwendet.",
      });
    }
  };
  
  const openNewModelDialog = () => {
    setCurrentModel(null);
    setFormData({
      name: "",
      beschreibung: "",
      regelJson: JSON.stringify({
        start: "09:00",
        ende: "17:00",
        tage: ["Mo", "Di", "Mi", "Do", "Fr"],
        pausenMinuten: 60
      }, null, 2)
    });
    setShowDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Arbeitszeitmodelle</h2>
        <Button onClick={openNewModelDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Neues Modell
        </Button>
      </div>
      
      {models.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">Keine Arbeitszeitmodelle vorhanden.</p>
          <Button onClick={openNewModelDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Erstes Modell erstellen
          </Button>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.beschreibung || "-"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(model)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Löschen</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentModel ? "Arbeitszeitmodell bearbeiten" : "Neues Arbeitszeitmodell"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Gleitzeit mit Kernzeit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="beschreibung">Beschreibung</Label>
              <Textarea
                id="beschreibung"
                value={formData.beschreibung}
                onChange={(e) => setFormData(prev => ({ ...prev, beschreibung: e.target.value }))}
                placeholder="Optionale Beschreibung"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regelJson">Regeln (JSON)</Label>
              <Alert className="mb-2">
                <AlertDescription className="text-xs">
                  Spezifizieren Sie hier die Regeln für das Arbeitszeitmodell im JSON-Format. 
                  Beispiele: Arbeitszeiten, Kernzeiten, Pausenregelungen etc.
                </AlertDescription>
              </Alert>
              <Textarea
                id="regelJson"
                value={formData.regelJson}
                onChange={(e) => setFormData(prev => ({ ...prev, regelJson: e.target.value }))}
                placeholder="{}"
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={currentModel ? handleUpdate : handleCreate}
              disabled={isCreating}
            >
              {isCreating ? "Wird gespeichert..." : currentModel ? "Aktualisieren" : "Erstellen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorktimeModels;
