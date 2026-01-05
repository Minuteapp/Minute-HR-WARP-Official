
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface BudgetExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BudgetExportDialog = ({ open, onOpenChange }: BudgetExportDialogProps) => {
  const [exportType, setExportType] = useState('excel');
  const [includeForecasts, setIncludeForecasts] = useState(true);
  const [includeActuals, setIncludeActuals] = useState(true);

  const handleExport = () => {
    console.log('Exporting budget data:', { exportType, includeForecasts, includeActuals });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Budget Export
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="exportType">Export-Format</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="datev">DATEV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Daten einschließen:</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="forecasts" 
                checked={includeForecasts}
                onCheckedChange={(checked) => setIncludeForecasts(checked === true)}
              />
              <Label htmlFor="forecasts">Prognosen</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="actuals" 
                checked={includeActuals}
                onCheckedChange={(checked) => setIncludeActuals(checked === true)}
              />
              <Label htmlFor="actuals">Ist-Werte</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportieren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
