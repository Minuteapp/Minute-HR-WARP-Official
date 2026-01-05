import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const InfoBanner = () => {
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-blue-900">Interaktives Organigramm</h3>
            <Badge variant="outline" className="text-xs">Vorschau</Badge>
          </div>
          <p className="text-sm text-blue-800">
            Klicken Sie auf die ⬆️⬇️ Buttons in den Team-Cards, um Hierarchien zu erweitern oder zu reduzieren. 
            Klicken Sie auf eine Card, um Details anzuzeigen. Nutzen Sie die Zoom-Controls oben rechts für die Ansicht.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setVisible(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          Verstecken
        </Button>
      </div>
    </div>
  );
};
