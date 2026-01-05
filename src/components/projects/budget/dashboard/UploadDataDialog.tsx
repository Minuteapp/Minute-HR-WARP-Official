
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface UploadDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadDataDialog = ({ open, onOpenChange }: UploadDataDialogProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = () => {
    if (file) {
      console.log('Uploading file:', file.name);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daten hochladen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Excel/CSV Datei auswählen</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleFileUpload} disabled={!file}>
            <Upload className="h-4 w-4 mr-2" />
            Hochladen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
