
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpIcon } from "lucide-react";
import { useState } from "react";

interface DocumentsSectionProps {
  onChange: (field: string, value: any) => void;
}

export const DocumentsSection = ({ onChange }: DocumentsSectionProps) => {
  const [documentAccess, setDocumentAccess] = useState("team");
  const [approvalProcess, setApprovalProcess] = useState("required");

  const handleAccessChange = (value: string) => {
    setDocumentAccess(value);
    onChange("documentAccess", value);
  };

  const handleApprovalChange = (value: string) => {
    setApprovalProcess(value);
    onChange("approvalProcess", value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Dokumente & Kommunikation</h3>
        <p className="text-sm text-gray-500">Laden Sie Dokumente hoch und konfigurieren Sie die Kommunikationseinstellungen.</p>
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-6 text-center">
          <FileUpIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-medium">Dokumente hochladen</h3>
          <p className="text-sm text-gray-500 mb-4">Unterstützte Formate: PDF, DOCX, XLSX, PPTX, JPG, PNG</p>
          <div className="flex justify-center">
            <Button type="button" className="flex items-center gap-2">
              <FileUpIcon className="h-4 w-4" />
              Dokumente hochladen
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">Die Dokumente werden dem Projekt zugeordnet gespeichert.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documentAccess">Dokumentenzugriff</Label>
          <Select value={documentAccess} onValueChange={handleAccessChange}>
            <SelectTrigger id="documentAccess">
              <SelectValue placeholder="Zugriff auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Für alle sichtbar</SelectItem>
              <SelectItem value="team">Nur für das Team</SelectItem>
              <SelectItem value="admin">Nur für Administratoren</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="approvalProcess">Freigabeprozess</Label>
          <Select value={approvalProcess} onValueChange={handleApprovalChange}>
            <SelectTrigger id="approvalProcess">
              <SelectValue placeholder="Freigabe auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Freigabe erforderlich</SelectItem>
              <SelectItem value="required">Freigabe erforderlich</SelectItem>
              <SelectItem value="multi">Mehrstufige Freigabe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
