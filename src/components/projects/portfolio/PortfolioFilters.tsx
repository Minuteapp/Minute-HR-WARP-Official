import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';

interface PortfolioFiltersProps {
  department: string;
  onDepartmentChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  program: string;
  onProgramChange: (value: string) => void;
  okr: string;
  onOKRChange: (value: string) => void;
  onShowOKROverlay: () => void;
}

export const PortfolioFilters = ({
  department,
  onDepartmentChange,
  location,
  onLocationChange,
  program,
  onProgramChange,
  okr,
  onOKRChange,
  onShowOKROverlay
}: PortfolioFiltersProps) => {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Vorschau</span>
        
        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="entwicklung">Entwicklung</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="vertrieb">Vertrieb</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="it">IT</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={location} onValueChange={onLocationChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Standorte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            <SelectItem value="berlin">Berlin</SelectItem>
            <SelectItem value="muenchen">München</SelectItem>
            <SelectItem value="hamburg">Hamburg</SelectItem>
            <SelectItem value="frankfurt">Frankfurt</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={program} onValueChange={onProgramChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Programme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Programme</SelectItem>
            <SelectItem value="q1-digital">Q1 2025 - Digital Transformation</SelectItem>
            <SelectItem value="q2-customer">Q2 2025 - Customer Experience</SelectItem>
            <SelectItem value="q3-employee">Q3 2025 - Employee Engagement</SelectItem>
            <SelectItem value="q2-data">Q2 2025 - Data Strategy</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={okr} onValueChange={onOKRChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle OKRs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle OKRs</SelectItem>
            <SelectItem value="operational">Operational Excellence</SelectItem>
            <SelectItem value="customer">Customer Satisfaction</SelectItem>
            <SelectItem value="innovation">Innovation</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="ml-auto gap-2" 
          onClick={onShowOKROverlay}
        >
          <Target className="h-4 w-4" />
          OKR-Overlay anzeigen
        </Button>
      </div>
    </div>
  );
};
