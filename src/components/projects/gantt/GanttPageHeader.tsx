
import { Briefcase } from "lucide-react";
import { ProjectsNavigation } from "@/components/projects/ProjectsNavigation";

export const GanttPageHeader = () => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Projektmanagement</h1>
        </div>
      </div>
      
      <ProjectsNavigation currentPath="/projects/gantt" />
    </div>
  );
};
