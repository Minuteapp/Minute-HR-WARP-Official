import { useState } from "react";
import { Globe } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const AISettingsBox = () => {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">KI-Einstellungen</h3>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox 
            id="ai-active" 
            checked={isActive} 
            onCheckedChange={(checked) => setIsActive(checked as boolean)} 
          />
          <label htmlFor="ai-active" className="text-sm text-foreground cursor-pointer">
            KI-Unterstützung aktiv
          </label>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="font-semibold text-purple-900 mb-1">KI-Prinzip: Erklärbar, transparent, nicht autonom</p>
        <p className="text-sm text-purple-800">
          Die KI analysiert Daten und gibt Empfehlungen, trifft aber keine eigenständigen Entscheidungen. 
          Alle Vorschläge müssen von Menschen geprüft und bestätigt werden.
        </p>
      </div>
    </div>
  );
};
