import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { TeamAward } from "@/integrations/supabase/hooks/useEmployeeRecognition";

interface TeamAwardsCardProps {
  teamAwards?: TeamAward[];
}

const getBadgeClassName = (color: string | null) => {
  switch (color) {
    case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'yellow': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

export const TeamAwardsCard = ({ teamAwards = [] }: TeamAwardsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Team-Auszeichnungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {teamAwards.map((award) => (
          <div 
            key={award.id} 
            className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{award.award_name}</h4>
              <Badge className={getBadgeClassName(award.badge_color)}>
                {award.badge_label || award.award_category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{award.description}</p>
            <div className="text-xs text-muted-foreground">
              {award.quarter} {award.year}
            </div>
          </div>
        ))}

        {teamAwards.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Keine Team-Auszeichnungen vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
