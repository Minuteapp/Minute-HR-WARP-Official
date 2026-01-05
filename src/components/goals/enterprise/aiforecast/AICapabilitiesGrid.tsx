import { Check, X } from "lucide-react";

export const AICapabilitiesGrid = () => {
  const capabilities = [
    { text: "Zielkonflikte erkennen", enabled: true },
    { text: "Verzögerungsrisiken aufzeigen", enabled: true },
    { text: "Ziel-Overload identifizieren", enabled: true },
    { text: "Prognosen erstellen", enabled: true },
    { text: "Management-Summaries", enabled: true },
    { text: "Keine autonomen Änderungen", enabled: false }
  ];

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold text-foreground mb-4">Was die KI analysiert</h3>
      <div className="grid grid-cols-2 gap-3">
        {capabilities.map((cap, index) => (
          <div key={index} className="flex items-center gap-2">
            {cap.enabled ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm ${cap.enabled ? 'text-foreground' : 'text-destructive'}`}>
              {cap.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
