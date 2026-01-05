import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface ReportCardProps {
  reportName: string;
  reportType: string;
  description: string;
  fileType: string;
  fileSize: string;
  createdDate: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  reportName,
  description,
  fileType,
  fileSize,
  createdDate
}) => {
  const getFileIcon = () => {
    return fileType === 'xlsx' ? '📊' : '📄';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
            {getFileIcon()}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{reportName}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="uppercase font-medium">{fileType}</span>
              <span>•</span>
              <span>{fileSize}</span>
              <span>•</span>
              <span>{new Date(createdDate).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
