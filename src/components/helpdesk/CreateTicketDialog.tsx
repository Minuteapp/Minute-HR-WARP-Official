
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Info } from "lucide-react";
import { useCreateHelpdeskTicket } from '@/hooks/useHelpdesk';

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  'Lohn & Gehalt',
  'Urlaub & Abwesenheit',
  'Arbeitszeit',
  'Dokumente',
  'IT-Support',
  'Compliance',
  'Onboarding',
  'Performance',
  'Sonstiges'
];

const priorities = [
  { value: 'low', label: 'Niedrig' },
  { value: 'medium', label: 'Normal' },
  { value: 'high', label: 'Hoch' },
  { value: 'urgent', label: 'Dringend' }
];

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const createTicket = useCreateHelpdeskTicket();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ticket erstellen (Anhänge werden später über Storage implementiert)
      await createTicket.mutateAsync({
        ...formData,
        status: 'open',
        language: 'de',
        business_impact: 'low',
        tags: [],
        ai_suggested_responses: [],
        similar_tickets: [],
        integration_data: {},
        metadata: attachments.length > 0 ? { attachmentCount: attachments.length } : {},
        created_by: '',
      });
      
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
      });
      setAttachments([]);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Neue Anfrage erstellen</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Erstellen Sie eine neue Support-Anfrage. Die KI hilft bei der automatischen Kategorisierung.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Betreff */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Betreff <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="z.B. Urlaubsantrag für August"
              required
            />
          </div>

          {/* Beschreibung */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Beschreibung <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreiben Sie Ihre Anfrage detailliert..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Je detaillierter Ihre Beschreibung, desto schneller können wir helfen.
            </p>
          </div>

          {/* Kategorie und Priorität nebeneinander */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">
                Kategorie <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-sm font-medium">Priorität</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Anhänge als Button-Style */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Anhänge</Label>
            <input
              type="file"
              id="ticket-attachments"
              className="hidden"
              multiple
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full justify-start text-muted-foreground"
              onClick={() => document.getElementById('ticket-attachments')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Datei hinzufügen
            </Button>
            {attachments.length > 0 && (
              <div className="space-y-1 mt-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1">
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Unterstützte Formate: PDF, DOCX, XLSX, PNG, JPG (max. 10 MB pro Datei)
            </p>
          </div>

          {/* Admin Info Banner */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Als HR-Admin wird Ihr Ticket mit erhöhter Priorität behandelt.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={createTicket.isPending}
              className="bg-foreground hover:bg-foreground/90 text-background"
            >
              {createTicket.isPending ? 'Erstelle...' : 'Anfrage erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
