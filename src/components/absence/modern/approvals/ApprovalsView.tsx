import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Clock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { ApprovalFilterSidebar } from './ApprovalFilterSidebar';
import { OpenApprovalsList } from './OpenApprovalsList';
import { absenceService } from '@/services/absenceService';
import { absenceExportService } from '@/services/absenceExportService';
import { toast } from '@/hooks/use-toast';
interface ApprovalFilters {
  types: string[];
  priorities: string[];
  departments: string[];
}

export const ApprovalsView = () => {
  const [filters, setFilters] = useState<ApprovalFilters>({
    types: [],
    priorities: [],
    departments: []
  });

  // Lade Statistiken aus der Datenbank
  const { data: stats, isLoading } = useQuery({
    queryKey: ['approval-statistics'],
    queryFn: () => absenceService.getApprovalStatistics(),
    refetchInterval: 30000 // Aktualisiere alle 30 Sekunden
  });

  const statsCards = [
    {
      title: 'Offene Anträge',
      value: isLoading ? '...' : stats?.pending.toString() || '0',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Ø Bearbeitungszeit',
      value: isLoading ? '...' : `${stats?.avgProcessingDays || 0} Tage`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Überfällige Anträge',
      value: isLoading ? '...' : stats?.overdue.toString() || '0',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Heute genehmigt',
      value: isLoading ? '...' : stats?.approvedToday.toString() || '0',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  // Lade alle Anträge für Export
  const { data: allRequests = [] } = useQuery({
    queryKey: ['all-absence-requests-export'],
    queryFn: () => absenceService.getRequests()
  });

  const handleExport = () => {
    const pendingRequests = allRequests.filter((r: any) => r.status === 'pending');
    if (pendingRequests.length === 0) {
      toast({
        title: 'Keine Daten',
        description: 'Es sind keine offenen Genehmigungen zum Exportieren vorhanden.',
        variant: 'destructive'
      });
      return;
    }
    absenceExportService.exportToExcel(pendingRequests, 'offene_genehmigungen');
    toast({
      title: 'Export erfolgreich',
      description: 'Die offenen Genehmigungen wurden exportiert.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <ApprovalFilterSidebar filters={filters} onFiltersChange={setFilters} />
        
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportieren
        </Button>
      </div>

      {/* Liste der offenen Genehmigungen */}
      <OpenApprovalsList filters={filters} />
    </div>
  );
};
