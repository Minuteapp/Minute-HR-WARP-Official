import { AlertTriangle } from "lucide-react";

export const RisksHeader = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-destructive/10 rounded-lg">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Risiken & Fristen</h2>
        <p className="text-sm text-muted-foreground">
          Überwachung aller Risiken und kritischen Fristen
        </p>
      </div>
    </div>
  );
};
