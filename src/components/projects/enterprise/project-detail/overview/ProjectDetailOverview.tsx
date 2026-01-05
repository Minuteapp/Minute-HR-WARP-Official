
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, CheckCircle, Users, Link as LinkIcon } from "lucide-react";
import { ProjectKPICards } from "./ProjectKPICards";
import { ProjectDetailsCard } from "./ProjectDetailsCard";
import { TeamMembersSection } from "./TeamMembersSection";
import { RoadmapLinkSection } from "./RoadmapLinkSection";
import { BudgetForecastCard } from "./BudgetForecastCard";

interface ProjectDetailOverviewProps {
  project: any;
}

export const ProjectDetailOverview = ({ project }: ProjectDetailOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <ProjectKPICards project={project} />

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ProjectDetailsCard project={project} />
          <TeamMembersSection projectId={project.id} />
          <RoadmapLinkSection project={project} />
        </div>
        <div>
          <BudgetForecastCard project={project} />
        </div>
      </div>
    </div>
  );
};
