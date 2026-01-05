
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles, FileText } from 'lucide-react';

interface UploadReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReceiptUploadForm) => void;
}

interface ReceiptUploadForm {
  date: string;
  amount: string;
  category: string;
  merchant: string;
  project: string;
  paymentType: string;
  description: string;
  receipt?: File;
}

const UploadReceiptDialog = ({ open, onOpenChange, onSubmit }: UploadReceiptDialogProps) => {
  const [formData, setFormData] = useState<ReceiptUploadForm>({
    date: '',
    amount: '',
    category: '',
    merchant: '',
    project: '',
    paymentType: '',
    description: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setFormData({ ...formData, receipt: e.target.files[0] });
      setIsProcessing(true);
      
      // Simulate OCR processing
      setTimeout(() => {
        setIsProcessing(false);
        setShowAiSuggestion(true);
      }, 1500);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    resetForm();
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
    setUploadedFile(null);
    setShowAiSuggestion(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Beleg hochladen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {isProcessing ? 'OCR wird verarbeitet...' : 'Erfolgreich hochgeladen'}
                  </p>
                </div>
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
          </div>

          {/* AI Suggestion Box */}
          {showAiSuggestion && (
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
              <Label htmlFor="upload-date">Datum</Label>
              <Input
                id="upload-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-amount">Betrag (€)</Label>
              <Input
                id="upload-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-category">Kategorie</Label>
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
              <Label htmlFor="upload-merchant">Händler</Label>
              <Input
                id="upload-merchant"
                placeholder="Name des Händlers"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-project">Projekt</Label>
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
              <Label htmlFor="upload-paymentType">Zahlungsart</Label>
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
            <Label htmlFor="upload-description">Beschreibung / Zweck</Label>
            <Textarea
              id="upload-description"
              placeholder="Beschreiben Sie den Zweck der Ausgabe..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>
            Einreichen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReceiptDialog;
