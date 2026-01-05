import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { absenceExportService } from '@/services/absenceExportService';

interface AbsenceQuickActionsFooterProps {
  onCalendarClick?: () => void;
}

export const AbsenceQuickActionsFooter: React.FC<AbsenceQuickActionsFooterProps> = ({ onCalendarClick }) => {
  const { data: allRequests = [] } = useQuery({
    queryKey: ['absence-requests-quick-export'],
    queryFn: () => absenceService.getRequests()
  });

  const handleExportReport = () => {
    if (allRequests.length === 0) {
      toast({
        title: 'Keine Daten',
        description: 'Es sind keine Abwesenheiten zum Exportieren vorhanden.',
        variant: 'destructive'
      });
      return;
    }
    absenceExportService.exportToPdf(allRequests, 'abwesenheitsbericht', 'Abwesenheitsbericht');
    toast({
      title: 'Export erfolgreich',
      description: 'Der Bericht wurde als PDF exportiert.'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="default" 
            size="lg" 
            className="flex-1 h-12"
            onClick={onCalendarClick}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Kalenderansicht öffnen
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 h-12"
            onClick={handleExportReport}
          >
            <Download className="h-5 w-5 mr-2" />
            Bericht exportieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
