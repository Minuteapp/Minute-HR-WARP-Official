import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";
import { EmployeeAward } from "@/integrations/supabase/hooks/useEmployeeRecognition";

interface EmployeeAwardsCardProps {
  awards?: EmployeeAward[];
}

const getBadgeVariant = (color: string | null) => {
  switch (color) {
    case 'yellow': return 'default';
    case 'orange': return 'secondary';
    case 'blue': return 'default';
    case 'green': return 'default';
    default: return 'outline';
  }
};

const getBadgeClassName = (color: string | null) => {
  switch (color) {
    case 'yellow': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

export const EmployeeAwardsCard = ({ awards = [] }: EmployeeAwardsCardProps) => {
  // Gruppiere nach Award-Typ
  const employeeOfYear = awards.filter(a => a.award_type === 'employee_of_year');
  const employeeOfMonth = awards.filter(a => a.award_type === 'employee_of_month');
  const topPerformer = awards.filter(a => a.award_type === 'top_performer');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-600" />
          Mitarbeiter-Auszeichnungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee of the Year */}
        {employeeOfYear.map((award) => (
          <div key={award.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{award.award_name}</h4>
                  <Badge className={getBadgeClassName(award.badge_color)}>
                    {award.badge_label || award.award_category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{award.description}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(award.received_date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Employee of the Month */}
        {employeeOfMonth.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-600" />
              Employee of the Month
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                {employeeOfMonth.length}x
              </Badge>
            </h4>
            {employeeOfMonth.map((award) => (
              <div key={award.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{award.award_category}</span>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                    {award.badge_label || award.quarter}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{award.description}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(award.received_date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Performer */}
        {topPerformer.map((award) => (
          <div key={award.id} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{award.award_name}</h4>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {award.badge_label || 'Aktuell'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{award.description}</p>
                {award.performance_score && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-2xl font-bold text-blue-600">{award.performance_score}%</div>
                    <div className="text-xs text-muted-foreground">Performance-Score</div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {award.quarter} {award.year}
                </div>
              </div>
            </div>
          </div>
        ))}

        {awards.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Noch keine Auszeichnungen vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
