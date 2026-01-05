import { Shield, FileCheck, Lock, User, Layers } from "lucide-react";

interface ComplianceFooterProps {
  activeRole?: string;
  totalTabs?: number;
  activeTabs?: number;
}

export const ComplianceFooter = ({ 
  activeRole = "HR-Manager", 
  totalTabs = 35, 
  activeTabs = 35 
}: ComplianceFooterProps) => {
  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>ISO 27001 zertifiziert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Alle Änderungen werden protokolliert</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>Aktuelle Rolle: {activeRole}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{activeTabs}/{totalTabs} Tabs aktiv</span>
          </div>
        </div>
      </div>
    </div>
  );
};
