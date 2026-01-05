import { GitBranch } from "lucide-react";

export const DependenciesHeader = () => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <GitBranch className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Abhängigkeiten & Wirkung</h2>
      </div>
      <p className="text-muted-foreground">
        Visualisierung von Zielbeziehungen und Impact-Analysen
      </p>
    </div>
  );
};
