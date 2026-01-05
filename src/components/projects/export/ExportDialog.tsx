
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, FileLineChart } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export const ExportDialog = ({ open, onOpenChange, projectId, projectName }: ExportDialogProps) => {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [loading, setLoading] = useState(false);
  const [includeOptions, setIncludeOptions] = useState({
    tasks: true,
    timeline: true,
    resources: true,
    team: true
  });

  const handleOptionChange = (option: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExport = async () => {
    setLoading(true);
    
    try {
      // Simuliere eine API-Anfrage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Erfolgsmeldung
      toast.success(`Projekt "${projectName}" wurde als ${exportFormat.toUpperCase()} exportiert`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Exportieren des Projekts");
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Projekt exportieren</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Exportformat</h3>
            <RadioGroup 
              value={exportFormat} 
              onValueChange={(value) => setExportFormat(value as "pdf" | "excel" | "csv")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  PDF-Dokument
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Excel-Tabelle
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileLineChart className="mr-2 h-4 w-4 text-blue-500" />
                  CSV-Datei
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Inhalt</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tasks" 
                  checked={includeOptions.tasks}
                  onCheckedChange={() => handleOptionChange('tasks')}
                />
                <Label htmlFor="tasks" className="cursor-pointer">Aufgaben</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="timeline" 
                  checked={includeOptions.timeline}
                  onCheckedChange={() => handleOptionChange('timeline')}
                />
                <Label htmlFor="timeline" className="cursor-pointer">Zeitplan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="resources" 
                  checked={includeOptions.resources}
                  onCheckedChange={() => handleOptionChange('resources')}
                />
                <Label htmlFor="resources" className="cursor-pointer">Ressourcen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="team" 
                  checked={includeOptions.team}
                  onCheckedChange={() => handleOptionChange('team')}
                />
                <Label htmlFor="team" className="cursor-pointer">Team</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? "Exportiere..." : "Exportieren"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
