
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewExpenseForm) => void;
  onSaveAsDraft: (data: NewExpenseForm) => void;
}

export interface NewExpenseForm {
  date: string;
  amount: string;
  category: string;
  merchant: string;
  project: string;
  paymentType: string;
  description: string;
  receipt?: File;
  receiptUrl?: string;
}

const NewExpenseDialog = ({ open, onOpenChange, onSubmit, onSaveAsDraft }: NewExpenseDialogProps) => {
  const [formData, setFormData] = useState<NewExpenseForm>({
    date: '',
    amount: '',
    category: '',
    merchant: '',
    project: '',
    paymentType: '',
    description: ''
  });
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadReceiptToStorage = async (file: File): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Nicht authentifiziert');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userData.user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('expense-documents')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload fehlgeschlagen: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('expense-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        const receiptUrl = await uploadReceiptToStorage(file);
        setFormData({ ...formData, receipt: file, receiptUrl });
        setHasUploadedFile(true);
        toast.success('Beleg erfolgreich hochgeladen');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Beleg konnte nicht hochgeladen werden');
        setHasUploadedFile(false);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.amount || !formData.category) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      await onSaveAsDraft(formData);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      amount: '',
      category: '',
      merchant: '',
      project: '',
      paymentType: '',
      description: ''
    });
    setHasUploadedFile(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Neue Ausgabe erfassen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-3" />
                <p className="text-lg font-medium text-foreground">Wird hochgeladen...</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium text-foreground mb-1">Beleg hochladen</p>
                <p className="text-sm text-muted-foreground mb-4">
                  OCR erkennt automatisch Datum, Betrag, MwSt. und Händler
                </p>
                <label>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700" asChild>
                    <span>Datei auswählen</span>
                  </Button>
                </label>
              </>
            )}
            {hasUploadedFile && !isUploading && (
              <p className="text-sm text-green-600 mt-2">✓ Datei erfolgreich hochgeladen</p>
            )}
          </div>

          {/* AI Suggestion Box */}
          {hasUploadedFile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-foreground">KI-Vorschlag</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Basierend auf dem Beleg wird vorgeschlagen: <strong>Kategorie: Bewirtung</strong>, <strong>Projekt: Projekt Beta</strong>
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Betrag (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Reisekosten</SelectItem>
                  <SelectItem value="hospitality">Bewirtung</SelectItem>
                  <SelectItem value="equipment">Arbeitsmittel</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="homeoffice">Homeoffice</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant">Händler</Label>
              <Input
                id="merchant"
                placeholder="Name des Händlers"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Projekt</Label>
              <Select value={formData.project} onValueChange={(v) => setFormData({ ...formData, project: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Projekt wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Projekt</SelectItem>
                  <SelectItem value="alpha">Projekt Alpha</SelectItem>
                  <SelectItem value="beta">Projekt Beta</SelectItem>
                  <SelectItem value="gamma">Projekt Gamma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">Zahlungsart</Label>
              <Select value={formData.paymentType} onValueChange={(v) => setFormData({ ...formData, paymentType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Zahlungsart wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privat</SelectItem>
                  <SelectItem value="corporate_card">Firmenkarte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung / Zweck</Label>
            <Textarea
              id="description"
              placeholder="Beschreiben Sie den Zweck der Ausgabe..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveAsDraft} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Als Entwurf speichern
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Einreichen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewExpenseDialog;
