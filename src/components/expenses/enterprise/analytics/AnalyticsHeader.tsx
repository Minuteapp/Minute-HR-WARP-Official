
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';

interface AnalyticsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onExport: () => void;
}

const AnalyticsHeader = ({ selectedPeriod, onPeriodChange, onExport }: AnalyticsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">Auswertungen & Reports</h2>
      <div className="flex items-center gap-3">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="this_year">Dieses Jahr</SelectItem>
            <SelectItem value="last_year">Letztes Jahr</SelectItem>
            <SelectItem value="q1">Q1</SelectItem>
            <SelectItem value="q2">Q2</SelectItem>
            <SelectItem value="q3">Q3</SelectItem>
            <SelectItem value="q4">Q4</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
