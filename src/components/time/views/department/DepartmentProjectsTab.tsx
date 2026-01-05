import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DepartmentProjectsTab = () => {
  const projects: Array<{ name: string; team: string; budget: string; progress: number; deadline: string; status: string }> = [];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50">
          <p className="text-sm font-medium text-muted-foreground">Gesamt Projekte</p>
          <p className="text-3xl font-bold mt-2">45</p>
          <p className="text-sm text-blue-600 mt-1">32 aktiv</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-50/50">
          <p className="text-sm font-medium text-muted-foreground">Budget zugewiesen</p>
          <p className="text-3xl font-bold mt-2">€12.5M</p>
          <p className="text-sm text-emerald-600 mt-1">68% genutzt</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-gray-300 bg-gray-50/50">
          <p className="text-sm font-medium text-muted-foreground">Durchschnittlicher Fortschritt</p>
          <p className="text-3xl font-bold mt-2">57%</p>
          <p className="text-sm text-blue-600 mt-1">Alle aktiven Projekte</p>
        </Card>
      </div>

      {/* Project Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Projekt Übersicht</h3>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={index} className="p-5 border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{project.name}</h4>
                  <Badge className="bg-gray-900 text-white hover:bg-gray-900">{project.status}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-bold">{project.budget}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">Team: {project.team}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                <span className="text-muted-foreground">Deadline</span>
                <span className="font-medium">{project.deadline}</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DepartmentProjectsTab;
