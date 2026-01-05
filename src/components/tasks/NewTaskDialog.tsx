import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Calendar, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewTaskDialog = ({ open, onOpenChange }: NewTaskDialogProps) => {
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // ZERO-DATA: KI-Vorschläge werden nur angezeigt, wenn KI-Feature aktiviert ist
  const aiSuggestions: string[] = [];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
          <p className="text-sm text-gray-600">
            Erstellen Sie eine neue Aufgabe und weisen Sie sie einem Projekt und Mitarbeiter zu.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Suggestions - nur anzeigen wenn vorhanden */}
          {showAISuggestions && aiSuggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">KI-Vorschläge</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input 
              id="title"
              placeholder="z.B. Vertrag für Neueinstellung prüfen"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea 
              id="description"
              placeholder="Detaillierte Beschreibung der Aufgabe..."
              rows={4}
            />
          </div>

          {/* Project and Responsible */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projekt</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Projekt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiting">Recruiting Q4 2025</SelectItem>
                  <SelectItem value="performance">Performance Management 2025</SelectItem>
                  <SelectItem value="digitalisierung">Digitalisierung HR-Prozesse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Verantwortlicher</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Person auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {/* ZERO-DATA: Verantwortliche aus DB laden */}
                  <SelectItem value="placeholder" disabled>Person aus Datenbank laden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fälligkeitsdatum</Label>
              <div className="relative">
                <Input 
                  type="date"
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select defaultValue="open">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in-progress">In Arbeit</SelectItem>
                <SelectItem value="review">Überprüfung</SelectItem>
                <SelectItem value="done">Erledigt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Tag hinzufügen..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Hinzufügen
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Recurring Task */}
          <div className="space-y-2">
            <Label>Wiederkehrende Aufgabe</Label>
            <Select defaultValue="none">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Wiederholung</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button>
              Aufgabe erstellen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
