import { GitBranch } from "lucide-react";

export const DependenciesInfoBox = () => {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="h-5 w-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">Abhängigkeitsmanagement</h4>
      </div>
      <div className="space-y-2 text-sm text-purple-800">
        <p>
          <span className="font-semibold">Blockiert:</span> Ziel A muss abgeschlossen sein, bevor Ziel B starten kann.
        </p>
        <p>
          <span className="font-semibold">Ermöglicht:</span> Erfolg von Ziel A schafft Grundlage für Ziel B.
        </p>
        <p>
          <span className="font-semibold">Beeinflusst:</span> Ziel A wirkt sich auf Erfolg von Ziel B aus, ohne es zu blockieren.
        </p>
      </div>
    </div>
  );
};
