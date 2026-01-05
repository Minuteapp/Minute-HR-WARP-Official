import { Zap, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PerformanceBanner = () => {
  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-cyan-600" />
        <div className="flex-1 flex items-center gap-3">
          <p className="text-sm text-cyan-900">
            <span className="font-semibold">Performance-Optimierung:</span> Organigramm verwendet 
            Lazy-Loading und zeigt nur 2 Ebenen gleichzeitig 10,000+ Mitarbeiter in der Hierarchie.
          </p>
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
            Optimiert für 10,000+
          </Badge>
          <div className="flex items-center gap-1 text-sm text-green-700">
            <Check className="h-4 w-4" />
            <span>Virtualisierung aktiv</span>
          </div>
        </div>
      </div>
    </div>
  );
};
