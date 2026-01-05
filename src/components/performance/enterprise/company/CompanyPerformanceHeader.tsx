import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendBadge } from "../common/TrendBadge";
import { OverdueReviewsBadge } from "../common/OverdueReviewsBadge";

export function CompanyPerformanceHeader() {
  const { data: companyPerformance } = useQuery({
    queryKey: ["company-performance-header"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_performance")
        .select("*")
        .eq("period", "current")
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const score = companyPerformance?.overall_score || 0;
  const trend = (companyPerformance?.trend as "rising" | "falling" | "stable") || "stable";
  const departments = companyPerformance?.total_departments || 0;
  const teams = companyPerformance?.total_teams || 0;
  const employees = companyPerformance?.total_employees || 0;
  const overdueReviews = companyPerformance?.overdue_reviews || 0;

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Gesamtunternehmen</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TrendBadge 
                    trend={trend} 
                    className="bg-white/20 text-white border-white/30"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{departments} Abteilungen</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{teams} Teams</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{employees} Mitarbeiter</span>
              </div>
              {overdueReviews > 0 && (
                <OverdueReviewsBadge 
                  count={overdueReviews} 
                  className="bg-orange-500 text-white border-orange-400"
                />
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{Math.round(score)}</div>
            <p className="text-sm opacity-80">Performance-Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
