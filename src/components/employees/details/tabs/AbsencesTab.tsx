import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const absenceTypeLabels: Record<string, string> = {
  vacation: "Urlaub",
  sick_leave: "Krankheit",
  parental: "Elternzeit",
  business_trip: "Dienstreise",
  other: "Sonstige"
};

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  approved: "Genehmigt",
  rejected: "Abgelehnt",
  archived: "Archiviert"
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-gray-100 text-gray-800"
};

export const AbsencesTab = ({ employeeId }: { employeeId: string }) => {
  // Erst die user_id aus der employees-Tabelle holen
  const { data: employee } = useQuery({
    queryKey: ["employee-user-id", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("user_id")
        .eq("id", employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const userId = employee?.user_id;

  const { data: absences, isLoading } = useQuery({
    queryKey: ["employee-absences", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("absence_requests")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: quotas } = useQuery({
    queryKey: ["absence-quotas", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("absence_quotas")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Lädt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Urlaubskontingent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Urlaubskontingent {new Date().getFullYear()}
            </span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Urlaubsantrag stellen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Verfügbar</p>
              <p className="text-2xl font-bold text-blue-600">
                {quotas?.total_days || 30} Tage
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Genommen</p>
              <p className="text-2xl font-bold text-orange-600">
                {quotas?.used_days || 0} Tage
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Verbleibend</p>
              <p className="text-2xl font-bold text-green-600">
                {(quotas?.total_days || 30) - (quotas?.used_days || 0)} Tage
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Geplant</p>
              <p className="text-2xl font-bold text-purple-600">
                {quotas?.planned_days || 0} Tage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abwesenheiten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Abwesenheiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {absences && absences.length > 0 ? (
              absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {absenceTypeLabels[absence.type] || absence.type}
                        </span>
                        <Badge className={statusColors[absence.status]}>
                          {statusLabels[absence.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(absence.start_date), "dd.MM.yyyy", { locale: de })}
                          {" - "}
                          {format(new Date(absence.end_date), "dd.MM.yyyy", { locale: de })}
                        </span>
                      </div>
                      {absence.reason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {absence.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Details
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Abwesenheiten vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
