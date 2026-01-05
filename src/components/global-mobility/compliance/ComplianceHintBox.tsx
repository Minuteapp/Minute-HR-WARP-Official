
import { AlertTriangle } from 'lucide-react';

export function ComplianceHintBox() {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
      <div>
        <p className="text-sm text-foreground">
          <strong>Compliance-Hinweis:</strong> Visa-Ablaufdaten und steuerliche Fristen werden automatisch überwacht. 
          Bei kritischen Terminen erhalten Sie rechtzeitig Benachrichtigungen.
        </p>
      </div>
    </div>
  );
}
