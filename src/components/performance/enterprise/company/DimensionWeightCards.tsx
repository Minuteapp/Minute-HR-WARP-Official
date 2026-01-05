import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DimensionScoreCard } from "../common/DimensionScoreCard";

export function DimensionWeightCards() {
  const { data: companyPerformance } = useQuery({
    queryKey: ["company-dimension-weights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_performance")
        .select("goals_weight, tasks_weight, feedback_weight, development_weight, goals_score, tasks_score, feedback_score, development_score")
        .eq("period", "current")
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const dimensions = [
    {
      dimension: "goals" as const,
      weight: companyPerformance?.goals_weight || 40,
      score: companyPerformance?.goals_score || 0,
      description: "Durchschnittliche Zielerreichung"
    },
    {
      dimension: "tasks" as const,
      weight: companyPerformance?.tasks_weight || 30,
      score: companyPerformance?.tasks_score || 0,
      description: "Aufgaben & Projekte"
    },
    {
      dimension: "feedback" as const,
      weight: companyPerformance?.feedback_weight || 20,
      score: companyPerformance?.feedback_score || 0,
      description: "Reviews & Feedback"
    },
    {
      dimension: "development" as const,
      weight: companyPerformance?.development_weight || 10,
      score: companyPerformance?.development_score || 0,
      description: "Lernen & Wachstum"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {dimensions.map((dim) => (
        <DimensionScoreCard
          key={dim.dimension}
          dimension={dim.dimension}
          weight={dim.weight}
          score={dim.score}
          description={dim.description}
        />
      ))}
    </div>
  );
}
