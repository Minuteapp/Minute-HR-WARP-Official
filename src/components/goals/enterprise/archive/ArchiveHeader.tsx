import { Archive } from "lucide-react";

export const ArchiveHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Archive className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Archiv</h2>
        <p className="text-muted-foreground">
          Abgeschlossene und archivierte Ziele
        </p>
      </div>
    </div>
  );
};
