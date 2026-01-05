import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Library, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  "Engagement",
  "Führung",
  "Kultur",
  "Wellbeing",
  "Remote Work",
  "Onboarding",
  "Karriere",
  "Team",
];

export const CreateTemplateDialog = ({ open, onOpenChange }: CreateTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleCreate = () => {
    if (!name.trim() || !category) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    toast.success("Vorlage erfolgreich erstellt");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setTags("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Vorlage erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name der Vorlage *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Remote Work Feedback 2025"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategorie *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Bitte wählen..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung der Vorlage..."
              className="min-h-[80px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (kommagetrennt)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="z.B. Remote, Kommunikation, 2025"
            />
          </div>

          {/* Add Questions Section */}
          <div className="space-y-2">
            <Label>Fragen hinzufügen</Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-primary text-primary hover:bg-primary/5"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Mit KI generieren
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-dashed"
              >
                <Library className="h-4 w-4 mr-2" />
                Aus Fragenbibliothek wählen
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Manuell hinzufügen
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            Vorlage erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
