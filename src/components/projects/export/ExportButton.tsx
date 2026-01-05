
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useState } from "react";
import { ExportDialog } from "./ExportDialog";

export interface ExportButtonProps {
  projectId: string;
  projectName: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
}

export const ExportButton = ({ 
  projectId, 
  projectName, 
  size = "default",
  variant = "outline"
}: ExportButtonProps) => {
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowExportDialog(true)}
        size={size}
        variant={variant}
        className="flex items-center gap-1"
      >
        <FileText className="h-4 w-4" />
        Exportieren
      </Button>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
};
