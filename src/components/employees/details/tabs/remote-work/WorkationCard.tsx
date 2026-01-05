import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, FileText } from "lucide-react";
import type { Workation, WorkationSummary } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CreateWorkationRequestDialog } from "./dialogs/CreateWorkationRequestDialog";

interface WorkationCardProps {
  summary?: WorkationSummary;
  workations?: Workation[];
}

export const WorkationCard = ({ summary, workations }: WorkationCardProps) => {
  const [workationDialogOpen, setWorkationDialogOpen] = useState(false);
  
  if (!summary) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'genehmigt':
        return 'bg-green-500';
      case 'ausstehend':
        return 'bg-blue-500';
      case 'abgelehnt':
        return 'bg-red-500';
      case 'abgeschlossen':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'genehmigt':
        return 'Genehmigt';
      case 'ausstehend':
        return 'Ausstehend';
      case 'abgelehnt':
        return 'Abgelehnt';
      case 'abgeschlossen':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'Spanien': '🇪🇸',
      'Portugal': '🇵🇹',
      'Italien': '🇮🇹',
      'Frankreich': '🇫🇷',
      'Griechenland': '🇬🇷',
    };
    return flags[country] || '🌍';
  };

  return (
    <Card className="bg-purple-100">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 text-white rounded-lg">
            <Plane className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Workation - Arbeiten aus dem Ausland</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Verfügbare Tage/Jahr</div>
            <div className="text-2xl font-bold text-purple-600">{summary.available_days_per_year}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.allowed_countries.join(', ')}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Bereits genutzt {summary.year}</div>
            <div className="text-2xl font-bold text-orange-600">{summary.days_used}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {workations && workations.filter(w => w.status === 'genehmigt').length} Workations
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Verbleibend {summary.year}</div>
            <div className="text-2xl font-bold text-green-600">{summary.days_remaining}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Bis 31.12.{summary.year}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Nächste Workation</div>
            <div className="text-lg font-bold text-blue-600">
              {summary.next_workation_country || 'Nicht geplant'}
            </div>
            {summary.next_workation_month && (
              <div className="text-xs text-muted-foreground mt-1">{summary.next_workation_month}</div>
            )}
          </div>
        </div>
        
        {workations && workations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Workation-Historie {summary.year}</h4>
            <div className="space-y-2">
              {workations.map((workation) => (
                <div key={workation.id} className="bg-white rounded-lg p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getCountryFlag(workation.country)}</span>
                    <div>
                      <p className="text-sm font-medium">{workation.city}, {workation.country}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(workation.start_date), 'dd.MM', { locale: de })} - {format(new Date(workation.end_date), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusBadgeColor(workation.status)} text-white`}>
                      {getStatusLabel(workation.status)}
                    </Badge>
                    <span className="text-sm font-medium">{workation.days_count} Tage</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Workation-Richtlinien ansehen
          </Button>
          <Button className="flex-1 bg-black hover:bg-black/90 text-white" size="sm" onClick={() => setWorkationDialogOpen(true)}>
            <Plane className="w-4 h-4 mr-2" />
            Neue Workation beantragen
          </Button>
        </div>

        <CreateWorkationRequestDialog
          open={workationDialogOpen}
          onOpenChange={setWorkationDialogOpen}
          employeeId={summary.employee_id}
          summary={{
            available_days: summary.available_days_per_year,
            used_days: summary.days_used,
            remaining_days: summary.days_remaining,
            allowed_countries: summary.allowed_countries,
          }}
        />
      </CardContent>
    </Card>
  );
};
