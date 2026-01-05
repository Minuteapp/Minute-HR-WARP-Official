import { FileText } from "lucide-react";

export const ReviewsHeader = () => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Reviews & Anpassungen</h2>
      </div>
      <p className="text-muted-foreground">
        Regelmäßige Überprüfung und Optimierung von Zielen
      </p>
    </div>
  );
};
