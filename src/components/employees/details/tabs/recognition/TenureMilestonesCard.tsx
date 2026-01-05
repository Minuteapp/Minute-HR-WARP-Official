import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, PartyPopper } from "lucide-react";
import { TenureMilestone } from "@/integrations/supabase/hooks/useEmployeeRecognition";
import { differenceInYears, differenceInMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TenureMilestonesCardProps {
  tenure?: TenureMilestone[];
  employeeId?: string;
}

export const TenureMilestonesCard = ({ tenure = [], employeeId }: TenureMilestonesCardProps) => {
  // Lade start_date direkt vom Mitarbeiter falls keine Tenure-Daten vorhanden
  const { data: employeeData } = useQuery({
    queryKey: ['employee-tenure-start', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('start_date, joining_date')
        .eq('id', employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId && tenure.length === 0,
  });

  const celebrated = tenure.filter(t => t.milestone_status === 'gefeiert');
  const upcoming = tenure.filter(t => t.milestone_status === 'zukünftig');
  
  // Berechne aktuelle Betriebszugehörigkeit - aus Tenure oder direkt vom Mitarbeiter
  const startDateFromTenure = tenure[0]?.start_date;
  const startDateFromEmployee = employeeData?.start_date || employeeData?.joining_date;
  const startDate = startDateFromTenure || startDateFromEmployee;
  const currentTenure = startDate ? differenceInYears(new Date(), new Date(startDate)) : 0;

  // Berechne Zeit bis zum nächsten Jubiläum
  const getTimeUntil = (date: string) => {
    const years = differenceInYears(new Date(date), new Date());
    const months = differenceInMonths(new Date(date), new Date()) % 12;
    return { years, months };
  };

  // Wenn keine Tenure-Daten aber start_date vorhanden, zeige Basis-Info
  const hasNoTenureData = tenure.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Betriebszugehörigkeit & Jubiläen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aktuelle Betriebszugehörigkeit */}
        {startDate && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Aktuelle Betriebszugehörigkeit</div>
                <div className="text-3xl font-bold text-purple-600">{currentTenure} Jahre</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Seit {new Date(startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                {currentTenure} Jahre
              </Badge>
            </div>
          </div>
        )}

        {/* Jubiläen Liste */}
        {!hasNoTenureData && (
          <div className="space-y-3">
            {celebrated.map((milestone) => (
              <div key={milestone.id} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <PartyPopper className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{milestone.tenure_years}-Jahres-Jubiläum</h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Gefeiert
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {milestone.celebrated_date && new Date(milestone.celebrated_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {milestone.gift_amount && (
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{milestone.gift_amount.toLocaleString()} {milestone.gift_currency}</span>
                        </div>
                      )}
                      {milestone.extra_vacation_days && (
                        <div className="text-muted-foreground">
                          + {milestone.extra_vacation_days} Extra-Urlaubstag{milestone.extra_vacation_days > 1 ? 'e' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {upcoming.map((milestone) => {
              const timeUntil = milestone.next_milestone_date ? getTimeUntil(milestone.next_milestone_date) : null;
              return (
                <div key={milestone.id} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{milestone.next_milestone_years}-Jahres-Jubiläum</h4>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          Zukünftig
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {milestone.next_milestone_date && new Date(milestone.next_milestone_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      {timeUntil && (
                        <div className="text-sm text-blue-600 mb-2">
                          In {timeUntil.years} Jahr{timeUntil.years !== 1 ? 'en' : ''}{timeUntil.months > 0 ? `, ${timeUntil.months} Monat${timeUntil.months !== 1 ? 'en' : ''}` : ''}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        {milestone.gift_amount && (
                          <div className="flex items-center gap-1">
                            <Gift className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{milestone.gift_amount.toLocaleString()} {milestone.gift_currency}</span>
                          </div>
                        )}
                        {milestone.extra_vacation_days && (
                          <div className="text-muted-foreground">
                            + {milestone.extra_vacation_days} Extra-Urlaubstag{milestone.extra_vacation_days > 1 ? 'e' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!startDate && hasNoTenureData && (
          <div className="text-center text-muted-foreground py-8">
            Keine Jubiläumsdaten vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
