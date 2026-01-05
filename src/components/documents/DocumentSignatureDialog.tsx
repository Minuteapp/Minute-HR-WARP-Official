import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pen, Type, Upload, Trash2, PenLine, Check, X, AlertTriangle } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { documentSignatureService } from '@/services/documents/documentSignatureService';
import type { Document } from '@/types/documents';

interface DocumentSignatureDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentSignatureDialog: React.FC<DocumentSignatureDialogProps> = ({
  document,
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [fontStyle, setFontStyle] = useState('cursive');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setIsDrawing(true);
        setHasDrawn(true);
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSign = async () => {
    if (!document) return;

    let signatureData = null;

    if (activeTab === 'draw') {
      if (!hasDrawn) {
        toast.error('Bitte zeichnen Sie Ihre Unterschrift');
        return;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        signatureData = canvas.toDataURL();
      }
    } else if (activeTab === 'type') {
      if (!typedName.trim()) {
        toast.error('Bitte geben Sie Ihren Namen ein');
        return;
      }
      signatureData = typedName;
    }

    if (!signatureData) {
      toast.error('Bitte erstellen Sie eine Signatur');
      return;
    }

    setIsSigning(true);
    try {
      await documentSignatureService.createSignature(document.id, signatureData, 'electronic');
      toast.success('Dokument erfolgreich signiert');
      onOpenChange(false);
    } catch (error) {
      toast.error('Fehler beim Signieren');
    } finally {
      setIsSigning(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Dokument signieren</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{document.title}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Violet Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <PenLine className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-primary">
                  Rechtsgültige elektronische Signatur
                </p>
                <p className="text-sm text-primary/80 mt-1">
                  Ihre Signatur ist gemäß eIDAS-Verordnung rechtsgültig. 
                  Zeitstempel und IP-Adresse werden protokolliert.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <Pen className="h-4 w-4" />
                Zeichnen
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Tippen
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Hochladen
              </TabsTrigger>
            </TabsList>

            {/* Draw Tab */}
            <TabsContent value="draw" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Unterschrift zeichnen</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCanvas}
                  className="text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground text-sm">Hier unterschreiben</p>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Zeichnen Sie Ihre Unterschrift mit der Maus oder dem Touchpad
              </p>
            </TabsContent>

            {/* Type Tab */}
            <TabsContent value="type" className="space-y-4 mt-4">
              <div>
                <label className="font-medium text-sm block mb-2">Schriftart auswählen</label>
                <Select value={fontStyle} onValueChange={setFontStyle}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cursive">Kursiv</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans">Sans-Serif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium text-sm block mb-2">Vollständiger Name</label>
                <Input
                  placeholder="Max Mustermann"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="text-lg"
                />
              </div>

              {typedName && (
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 bg-background">
                  <p
                    className="text-4xl text-center"
                    style={{
                      fontFamily: fontStyle === 'cursive' ? 'cursive' : fontStyle === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif'
                    }}
                  >
                    {typedName}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center bg-background">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Laden Sie eine Bilddatei Ihrer Unterschrift hoch
                </p>
                <Button variant="outline">
                  Datei auswählen
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Yellow Legal Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 shrink-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Hinweis
              </Badge>
              <p className="text-sm text-yellow-800">
                Mit Ihrer Signatur bestätigen Sie, dass Sie den Inhalt des Dokuments
                gelesen haben und damit einverstanden sind. Diese Signatur ist rechtlich
                bindend.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button
              onClick={handleSign}
              disabled={isSigning}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Jetzt signieren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
