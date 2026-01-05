import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface AuditPackageCardProps {
  onGeneratePackage?: () => void;
}

export const AuditPackageCard: React.FC<AuditPackageCardProps> = ({ onGeneratePackage }) => {
  return (
    <Card className="bg-card border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Audit-Paket generieren</h3>
              <p className="text-sm text-muted-foreground">
                Erstellen Sie ein vollständiges Audit-Paket mit allen relevanten Nachweisen, Dokumenten und Berichten für externe Prüfungen.
              </p>
            </div>
          </div>
          <Button 
            onClick={onGeneratePackage}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Komplettes Audit-Paket erstellen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
