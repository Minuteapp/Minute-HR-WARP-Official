
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { StatusChangeDropdown } from "./StatusChangeDropdown";

interface ProjectDetailHeaderProps {
  project: any;
}

export const ProjectDetailHeader = ({ project }: ProjectDetailHeaderProps) => {
  const [currentStatus, setCurrentStatus] = useState(project.status || 'active');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'at-risk':
        return <Badge className="bg-orange-100 text-orange-600 border border-orange-200 hover:bg-orange-100">At Risk</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-600 border border-green-200 hover:bg-green-100">Aktiv</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100">Verspätet</Badge>;
      case 'on-hold':
        return <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100">On Hold</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-600 border border-green-200 hover:bg-green-100">Abgeschlossen</Badge>;
      case 'planning':
        return <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100">Planung</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100">Abgebrochen</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <Badge className="bg-red-500 text-white hover:bg-red-500">Risiko: Kritisch</Badge>;
      case 'high':
        return <Badge className="bg-red-500 text-white hover:bg-red-500">Risiko: Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">Risiko: Mittel</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">Risiko: Niedrig</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="px-6 pb-4">
      <div className="flex items-start justify-between">
        {/* Left side - Badges and Title */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100">
              {project.category || 'IT'}
            </Badge>
            {getStatusBadge(currentStatus)}
            {getRiskBadge(project.risk_level || 'high')}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || 'Keine Beschreibung vorhanden.'}</p>
        </div>

        {/* Right side - Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <StatusChangeDropdown 
            currentStatus={currentStatus} 
            onStatusChange={setCurrentStatus}
            projectId={project.id}
          />
        </div>
      </div>
    </div>
  );
};
