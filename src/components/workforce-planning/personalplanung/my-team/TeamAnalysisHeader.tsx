import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

interface TeamAnalysisHeaderProps {
  onTeamChange?: (team: string) => void;
  onViewChange?: (view: string) => void;
  onExport?: () => void;
}

export const TeamAnalysisHeader = ({ 
  onTeamChange, 
  onViewChange, 
  onExport 
}: TeamAnalysisHeaderProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Ist-Analyse & Kapazitäten</h2>
        <p className="text-sm text-muted-foreground">
          Aktuelle Personalstruktur, Kapazitäten und Auslastung
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="all" onValueChange={onTeamChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            <SelectItem value="it">IT</SelectItem>
            <SelectItem value="vertrieb">Vertrieb</SelectItem>
            <SelectItem value="produktion">Produktion</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="capacity" onValueChange={onViewChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kapazitätsansicht" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="capacity">Kapazitätsansicht</SelectItem>
            <SelectItem value="headcount">Headcount-Ansicht</SelectItem>
            <SelectItem value="fte">FTE-Ansicht</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="default" 
          className="bg-purple-600 hover:bg-purple-700 ml-auto"
          onClick={onExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
