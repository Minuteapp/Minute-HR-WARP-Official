
import { Info } from 'lucide-react';

export function EmployeesHintBox() {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
      <Info className="h-5 w-5 text-primary mt-0.5" />
      <div>
        <p className="text-sm text-foreground">
          <strong>Hinweis:</strong> Vollständige Mitarbeiterdaten sind essentiell für erfolgreiche Entsendungen. 
          Achten Sie auf aktuelle Vertragsinformationen und Familienangaben für Visa-Anträge und Relocation-Planung.
        </p>
      </div>
    </div>
  );
}
