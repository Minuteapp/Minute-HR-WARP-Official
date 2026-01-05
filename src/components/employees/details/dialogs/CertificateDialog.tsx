import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  certificate?: any;
  mode: 'create' | 'edit';
}

export const CertificateDialog = ({ open, onOpenChange, onSubmit, certificate, mode }: CertificateDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    certificate_name: '',
    category: 'Fachzertifikat',
    issuing_organization: '',
    certificate_number: '',
    issue_date: '',
    expiry_date: '',
  });

  useEffect(() => {
    if (certificate && mode === 'edit') {
      setFormData({
        certificate_name: certificate.certificate_name || '',
        category: certificate.category || 'Fachzertifikat',
        issuing_organization: certificate.issuing_organization || '',
        certificate_number: certificate.certificate_number || '',
        issue_date: certificate.issue_date?.split('T')[0] || '',
        expiry_date: certificate.expiry_date?.split('T')[0] || '',
      });
    } else {
      setFormData({
        certificate_name: '',
        category: 'Fachzertifikat',
        issuing_organization: '',
        certificate_number: '',
        issue_date: '',
        expiry_date: '',
      });
    }
  }, [certificate, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting certificate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neues Zertifikat hinzufügen' : 'Zertifikat bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="certificate_name">Zertifikatsname *</Label>
            <Input 
              id="certificate_name" 
              value={formData.certificate_name}
              onChange={(e) => setFormData(prev => ({ ...prev, certificate_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Kategorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fachzertifikat">Fachzertifikat</SelectItem>
                <SelectItem value="IT-Zertifikat">IT-Zertifikat</SelectItem>
                <SelectItem value="Sprachzertifikat">Sprachzertifikat</SelectItem>
                <SelectItem value="Sicherheit">Sicherheit</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="issuing_organization">Ausstellende Organisation</Label>
            <Input 
              id="issuing_organization" 
              value={formData.issuing_organization}
              onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="certificate_number">Zertifikatsnummer</Label>
            <Input 
              id="certificate_number" 
              value={formData.certificate_number}
              onChange={(e) => setFormData(prev => ({ ...prev, certificate_number: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">Ausstellungsdatum *</Label>
              <Input 
                id="issue_date" 
                type="date" 
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiry_date">Ablaufdatum</Label>
              <Input 
                id="expiry_date" 
                type="date" 
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : mode === 'create' ? 'Hinzufügen' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
