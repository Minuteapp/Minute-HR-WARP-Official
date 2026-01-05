import { Shield, Clock, FileCheck, Lock } from "lucide-react";

export const ArchiveComplianceBox = () => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-primary mb-2">DSGVO & Audit-Konformität</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Das Archiv erfüllt alle datenschutzrechtlichen Anforderungen und ermöglicht vollständige Audit-Trails.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span><strong>Aufbewahrung:</strong> Konfigurierbare Fristen</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileCheck className="h-4 w-4 text-primary" />
              <span><strong>Audit-Log:</strong> Vollständige Änderungshistorie</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-primary" />
              <span><strong>Zugriffsschutz:</strong> Rollenbasierte Berechtigungen</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span><strong>Löschung:</strong> DSGVO-konforme Datenlöschung</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
