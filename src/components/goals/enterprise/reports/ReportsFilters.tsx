import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ReportsFiltersProps {
  reportType: string;
  setReportType: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  goalType: string;
  setGoalType: (value: string) => void;
  period: string;
  setPeriod: (value: string) => void;
}

export const ReportsFilters = ({
  reportType,
  setReportType,
  level,
  setLevel,
  goalType,
  setGoalType,
  period,
  setPeriod
}: ReportsFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Berichtstyp</Label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue placeholder="Berichtstyp wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="level">Zielerreichung nach Ebene</SelectItem>
            <SelectItem value="delays">Zielverzögerungen</SelectItem>
            <SelectItem value="impact">Ziel-Impact-Analyse</SelectItem>
            <SelectItem value="okr">OKR-Fortschritt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ebene</Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Ebene wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Ebenen</SelectItem>
            <SelectItem value="company">Unternehmensziele</SelectItem>
            <SelectItem value="department">Bereichsziele</SelectItem>
            <SelectItem value="team">Teamziele</SelectItem>
            <SelectItem value="individual">Individuelle Ziele</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Typ</Label>
        <Select value={goalType} onValueChange={setGoalType}>
          <SelectTrigger>
            <SelectValue placeholder="Typ wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="strategic">Strategisch</SelectItem>
            <SelectItem value="operational">Operativ</SelectItem>
            <SelectItem value="okr">OKR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Zeitraum</Label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger>
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="q1">Q1 2025</SelectItem>
            <SelectItem value="q2">Q2 2025</SelectItem>
            <SelectItem value="q3">Q3 2025</SelectItem>
            <SelectItem value="q4">Q4 2025</SelectItem>
            <SelectItem value="year">Gesamtjahr 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
