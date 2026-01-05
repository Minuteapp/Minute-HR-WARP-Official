import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { OccupationalHealthExam } from "@/integrations/supabase/hooks/useEmployeeHealth";

interface OccupationalHealthExamsCardProps {
  data?: OccupationalHealthExam[];
}

export const OccupationalHealthExamsCard = ({ data }: OccupationalHealthExamsCardProps) => {
  const latestExam = data?.[0];

  if (!latestExam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Betriebsärztliche Untersuchungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Keine Untersuchungen geplant</p>
        </CardContent>
      </Card>
    );
  }

  const getResultBadgeVariant = (result: string | null) => {
    if (result === 'passed') return 'default';
    if (result === 'failed') return 'destructive';
    return 'secondary';
  };

  const getResultLabel = (result: string | null) => {
    if (result === 'passed') return 'Bestanden';
    if (result === 'failed') return 'Nicht bestanden';
    return 'Ausstehend';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Betriebsärztliche Untersuchungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Nächste Untersuchung</h4>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                Terminiert
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Datum: </span>
                {latestExam.next_exam_date
                  ? format(new Date(latestExam.next_exam_date), 'dd. MMMM yyyy', { locale: de })
                  : 'Nicht festgelegt'}
              </p>
              <p>
                <span className="font-medium">Typ: </span>
                {latestExam.exam_type === 'annual_checkup' ? 'Jährliche Untersuchung' : 'Spezielle Untersuchung'}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Letzte Untersuchung</h4>
              <Badge variant={getResultBadgeVariant(latestExam.last_exam_result)}>
                {getResultLabel(latestExam.last_exam_result)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Datum: </span>
                {latestExam.last_exam_date
                  ? format(new Date(latestExam.last_exam_date), 'dd. MMMM yyyy', { locale: de })
                  : 'Nicht verfügbar'}
              </p>
              {latestExam.company_doctor_name && (
                <p>
                  <span className="font-medium">Betriebsarzt: </span>
                  {latestExam.company_doctor_name}
                </p>
              )}
              {latestExam.exam_interval && (
                <p>
                  <span className="font-medium">Intervall: </span>
                  {latestExam.exam_interval === 'yearly' ? 'Jährlich' : 
                   latestExam.exam_interval === 'biannual' ? 'Halbjährlich' : 'Alle 3 Jahre'}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          Termin ändern
        </Button>
      </CardContent>
    </Card>
  );
};
