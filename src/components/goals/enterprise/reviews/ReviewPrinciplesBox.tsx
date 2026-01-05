import { FileText } from "lucide-react";

export const ReviewPrinciplesBox = () => {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">Review-Prinzipien</h4>
      </div>
      <div className="space-y-2 text-sm text-purple-800">
        <p>
          <span className="font-semibold">Regelmäßigkeit:</span> Reviews erfolgen gemäß definiertem Zyklus
        </p>
        <p>
          <span className="font-semibold">Transparenz:</span> Alle Anpassungen werden dokumentiert und begründet
        </p>
        <p>
          <span className="font-semibold">Versionierung:</span> Jede Änderung erhöht die Zielversion
        </p>
        <p>
          <span className="font-semibold">Audit-Fähigkeit:</span> Vollständige Historie im Audit-Log
        </p>
      </div>
    </div>
  );
};
