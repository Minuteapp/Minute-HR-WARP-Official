import { FileText, Printer, Mail, Calendar } from "lucide-react";

export const ReportsIntegrationBox = () => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-primary mb-2">Export-Integration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Berichte können in verschiedenen Formaten exportiert und weiterverarbeitet werden.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Printer className="h-4 w-4 text-primary" />
              <span><strong>PDF:</strong> Druckoptimierte Berichte mit Grafiken</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span><strong>Excel:</strong> Rohdaten für eigene Analysen</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span><strong>Automatisiert:</strong> Geplante Berichte per E-Mail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
