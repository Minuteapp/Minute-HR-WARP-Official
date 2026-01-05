import { FileText } from "lucide-react";

export const ReportsHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Reports & Export</h2>
        <p className="text-muted-foreground">
          Berichterstattung, Dashboards und Datenexport
        </p>
      </div>
    </div>
  );
};
