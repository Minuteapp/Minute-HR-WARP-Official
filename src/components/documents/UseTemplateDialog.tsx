import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  content?: string;
}

interface UseTemplateDialogProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UseTemplateDialog = ({ template, open, onOpenChange }: UseTemplateDialogProps) => {
  const { toast } = useToast();
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  // Platzhalter aus dem Content extrahieren
  const placeholders = useMemo(() => {
    if (!template.content) return [];
    const regex = /\{\{([A-Z_]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(template.content)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  }, [template.content]);

  // Vorschau generieren
  const preview = useMemo(() => {
    if (!template.content) return "";
    let result = template.content;
    for (const [key, value] of Object.entries(placeholderValues)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
    }
    return result;
  }, [template.content, placeholderValues]);

  useEffect(() => {
    // Reset bei neuer Vorlage
    const initial: Record<string, string> = {};
    placeholders.forEach(p => {
      initial[p] = "";
    });
    setPlaceholderValues(initial);
  }, [template.id, placeholders]);

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerate = () => {
    // Prüfen ob alle Platzhalter ausgefüllt sind
    const missing = placeholders.filter(p => !placeholderValues[p]?.trim());
    if (missing.length > 0) {
      toast({
        title: "Warnung",
        description: `Folgende Platzhalter sind noch leer: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // In Zwischenablage kopieren
    navigator.clipboard.writeText(preview);
    toast({
      title: "Erfolg",
      description: "Generierter Text wurde in die Zwischenablage kopiert",
    });

    onOpenChange(false);
  };

  const getPlaceholderLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'VORNAME': 'Vorname',
      'NACHNAME': 'Nachname',
      'ANREDE': 'Anrede',
      'DATUM': 'Datum',
      'FIRMA': 'Firma',
      'POSITION': 'Position',
      'ABTEILUNG': 'Abteilung',
      'EMAIL': 'E-Mail',
      'TELEFON': 'Telefon',
      'ADRESSE': 'Adresse',
      'BETRAG': 'Betrag',
      'STARTDATUM': 'Startdatum',
      'ENDDATUM': 'Enddatum',
    };
    return labels[key] || key.replace(/_/g, ' ');
  };

  if (!template.content) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorlage verwenden: {template.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Diese Vorlage hat keinen Inhalt.</p>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Vorlage verwenden: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Platzhalter-Eingabe */}
          <div className="space-y-4">
            <h3 className="font-medium">Platzhalter ausfüllen</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {placeholders.map((placeholder) => (
                  <div key={placeholder} className="space-y-1">
                    <Label htmlFor={placeholder}>{getPlaceholderLabel(placeholder)}</Label>
                    <Input
                      id={placeholder}
                      value={placeholderValues[placeholder] || ""}
                      onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                      placeholder={`{{${placeholder}}}`}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Vorschau */}
          <div className="space-y-4">
            <h3 className="font-medium">Vorschau</h3>
            <ScrollArea className="h-[400px]">
              <Textarea
                value={preview}
                readOnly
                className="h-full min-h-[380px] font-mono text-sm resize-none"
              />
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleGenerate}>
            Text generieren & kopieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UseTemplateDialog;
