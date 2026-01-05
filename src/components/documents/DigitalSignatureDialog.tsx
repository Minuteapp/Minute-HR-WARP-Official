import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentSignatures } from "@/hooks/useDocumentSignatures";
import { PenTool, Type, Fingerprint } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';

interface DigitalSignatureDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DigitalSignatureDialog = ({ 
  documentId, 
  open, 
  onOpenChange 
}: DigitalSignatureDialogProps) => {
  const { signDocument, isSigning } = useDocumentSignatures(documentId);
  const [activeTab, setActiveTab] = useState('draw');
  const [textSignature, setTextSignature] = useState('');
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleSign = async () => {
    let signatureData = {};

    switch (activeTab) {
      case 'draw':
        if (signatureRef.current?.isEmpty()) {
          alert('Bitte erstellen Sie eine Signatur');
          return;
        }
        signatureData = {
          type: 'drawn',
          data: signatureRef.current.toDataURL(),
          timestamp: new Date().toISOString()
        };
        break;
      
      case 'text':
        if (!textSignature.trim()) {
          alert('Bitte geben Sie Ihren Namen ein');
          return;
        }
        signatureData = {
          type: 'text',
          data: textSignature.trim(),
          timestamp: new Date().toISOString()
        };
        break;
      
      case 'biometric':
        // Hier würde in einer echten Anwendung eine biometrische Signatur erstellt
        signatureData = {
          type: 'biometric',
          data: 'biometric_placeholder',
          timestamp: new Date().toISOString()
        };
        break;
    }

    try {
      await signDocument({
        documentId,
        signatureData,
        signatureType: activeTab === 'biometric' ? 'biometric' : 'digital'
      });
      onOpenChange(false);
      
      // Canvas zurücksetzen
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
      setTextSignature('');
    } catch (error) {
      console.error('Signature error:', error);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dokument digital signieren</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Zeichnen
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="biometric" className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              Biometrisch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              <p className="text-sm text-muted-foreground mb-3">
                Zeichnen Sie Ihre Signatur in das Feld unten:
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas w-full'
                  }}
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  Löschen
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Geben Sie Ihren vollständigen Namen ein:
              </p>
              <input
                type="text"
                value={textSignature}
                onChange={(e) => setTextSignature(e.target.value)}
                placeholder="Ihr vollständiger Name"
                className="w-full p-3 border rounded-lg text-lg italic"
                style={{ fontFamily: 'cursive' }}
              />
              {textSignature && (
                <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-2">Vorschau:</p>
                  <div 
                    className="text-2xl italic text-primary"
                    style={{ fontFamily: 'cursive' }}
                  >
                    {textSignature}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="biometric" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <Fingerprint className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">Biometrische Signatur</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Diese Funktion würde in einer echten Anwendung biometrische Daten erfassen.
                  Für diese Demo wird eine Platzhalter-Signatur erstellt.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSign}
            disabled={isSigning}
          >
            {isSigning ? 'Wird signiert...' : 'Signieren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};