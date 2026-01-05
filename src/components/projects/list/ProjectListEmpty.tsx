
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export interface ProjectListEmptyProps {
  onNewProject?: () => void;
}

export const ProjectListEmpty = ({ onNewProject }: ProjectListEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg bg-muted/10">
      <h3 className="text-xl font-medium mb-2">Keine Projekte gefunden</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Es wurden keine Projekte gefunden, die den aktuellen Filterkriterien entsprechen.
        Erstellen Sie ein neues Projekt oder passen Sie Ihre Filter an.
      </p>
      {onNewProject && (
        <Button onClick={onNewProject} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Neues Projekt erstellen
        </Button>
      )}
    </div>
  );
};
