
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";

interface ProjectListHeaderProps {
  onNewProject: () => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
}

export const ProjectListHeader = ({
  onNewProject,
  viewMode,
  onViewModeChange
}: ProjectListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Projekte</h2>
      <div className="flex gap-2">
        <div className="hidden md:flex gap-1 border rounded p-1 mr-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="px-2 py-1"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className="px-2 py-1"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onNewProject} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" />
          Neues Projekt
        </Button>
      </div>
    </div>
  );
};
