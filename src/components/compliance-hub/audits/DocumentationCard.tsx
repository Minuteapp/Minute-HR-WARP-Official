import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Check, Download } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface DocumentationItem {
  id: string;
  name: string;
  description: string;
  dataPoints: number;
  lastGenerated: Date;
  isAvailable: boolean;
}

interface DocumentationCardProps {
  item: DocumentationItem;
  onExportPDF?: (itemId: string) => void;
  onExportExcel?: (itemId: string) => void;
}

export const DocumentationCard: React.FC<DocumentationCardProps> = ({ 
  item, 
  onExportPDF,
  onExportExcel 
}) => {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{item.name}</h3>
                {item.isAvailable && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span><strong>Datenpunkte:</strong> {item.dataPoints}</span>
                <span><strong>Zuletzt generiert:</strong> {format(item.lastGenerated, 'dd.MM.yyyy', { locale: de })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={() => onExportPDF?.(item.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExportExcel?.(item.id)}
            >
              <Download className="h-4 w-4 mr-1" />
              Export Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
