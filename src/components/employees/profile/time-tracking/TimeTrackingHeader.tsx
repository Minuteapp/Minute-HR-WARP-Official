
import { Button } from "@/components/ui/button";
import { Calendar, UploadCloud, Plus, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimeTrackingHeaderProps {
  onAddTime: () => void;
  onUpload: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const TimeTrackingHeader = ({ onAddTime, onUpload, onExportCSV, onExportPDF }: TimeTrackingHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="mr-2 h-6 w-6 text-primary" />
          Zeiterfassung
        </h2>
        <p className="text-gray-500 mt-1">Verwalten Sie Arbeitszeiten und Buchungen</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onUpload}
          className="flex items-center"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Import
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onExportCSV}>
              Als CSV exportieren
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              Als PDF exportieren
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          onClick={onAddTime}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Zeit hinzufügen
        </Button>
      </div>
    </div>
  );
};
