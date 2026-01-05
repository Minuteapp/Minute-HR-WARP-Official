import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const TEMPLATE_CATEGORIES = [
  { value: 'contract', label: 'Verträge' },
  { value: 'certificate', label: 'Zertifikate' },
  { value: 'policy', label: 'Richtlinien' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'hr', label: 'Personal' },
  { value: 'finance', label: 'Finanzen' },
  { value: 'legal', label: 'Rechtliches' },
  { value: 'other', label: 'Sonstiges' },
];

const CreateTemplateDialog = ({ open, onOpenChange, onCreated }: CreateTemplateDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Fehler",
        description: "Name ist erforderlich",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Fehler",
        description: "Kategorie ist erforderlich",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // company_id über RPC ermitteln
      const { data: companyId, error: companyError } = await supabase.rpc('get_effective_company_id');
      
      if (companyError) throw companyError;
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }

      const { error } = await supabase
        .from('document_templates')
        .insert({
          company_id: companyId,
          name: name.trim(),
          category,
          description: description.trim() || null,
          content: content.trim() || null,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Vorlage wurde erstellt",
      });

      // Reset form
      setName("");
      setCategory("");
      setDescription("");
      setContent("");
      
      onCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Fehler beim Erstellen der Vorlage:', error);
      toast({
        title: "Fehler",
        description: error.message || "Vorlage konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neue Vorlage erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vorlagenname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung der Vorlage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Inhalt mit Platzhaltern</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"Sehr geehrte/r {{ANREDE}} {{NACHNAME}},\n\nhiermit bestätigen wir...\n\nMit freundlichen Grüßen\n{{FIRMA}}"}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Verwenden Sie {"{{PLATZHALTER}}"} für dynamische Inhalte. Beispiele: {"{{VORNAME}}"}, {"{{NACHNAME}}"}, {"{{DATUM}}"}, {"{{FIRMA}}"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Erstellen..." : "Vorlage erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
