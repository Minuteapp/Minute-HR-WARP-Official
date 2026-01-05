import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PreventiveMedicalExam } from "@/integrations/supabase/hooks/useEmployeeHealth";

interface PreventiveMedicalExamsCardProps {
  exams?: PreventiveMedicalExam[];
}

export const PreventiveMedicalExamsCard = ({ exams }: PreventiveMedicalExamsCardProps) => {
  if (!exams || exams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Arbeitsmedizinische Vorsorge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Keine Vorsorgeuntersuchungen erforderlich</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'current') return { variant: 'default' as const, label: 'Aktuell', className: 'bg-green-500/10 text-green-700 border-green-200' };
    if (status === 'upcoming') return { variant: 'secondary' as const, label: 'Fällig bald', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' };
    return { variant: 'destructive' as const, label: 'Überfällig', className: '' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Arbeitsmedizinische Vorsorge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {exams.map((exam) => {
            const statusInfo = getStatusBadge(exam.status);
            return (
              <div key={exam.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{exam.exam_code} - {exam.exam_name}</h4>
                      {exam.is_required && (
                        <Badge variant="outline" className="text-xs">
                          Erforderlich
                        </Badge>
                      )}
                    </div>
                    {exam.exam_description && (
                      <p className="text-sm text-muted-foreground">{exam.exam_description}</p>
                    )}
                  </div>
                  <Badge variant={statusInfo.variant} className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-2 border-t">
                  <div>
                    <span className="font-medium">Letzte Untersuchung:</span>
                    <p>
                      {exam.last_exam_date
                        ? format(new Date(exam.last_exam_date), 'dd.MM.yyyy', { locale: de })
                        : 'Nicht verfügbar'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Nächste Untersuchung:</span>
                    <p>
                      {exam.next_exam_date
                        ? format(new Date(exam.next_exam_date), 'dd.MM.yyyy', { locale: de })
                        : 'Nicht geplant'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Alle Untersuchungsergebnisse anzeigen
        </Button>
      </CardContent>
    </Card>
  );
};
