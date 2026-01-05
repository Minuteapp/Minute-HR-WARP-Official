import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface HRNotesFiltersProps {
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  visibilityFilter: string;
  setVisibilityFilter: (value: string) => void;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
  attachmentsOnly: boolean;
  setAttachmentsOnly: (value: boolean) => void;
}

const categories = [
  { value: "all", label: "Alle Kategorien" },
  { value: "performance_review", label: "Leistungsbeurteilung" },
  { value: "compensation", label: "Vergütung" },
  { value: "project", label: "Projekt" },
  { value: "work_arrangement", label: "Arbeitsmodell" },
  { value: "onboarding", label: "Onboarding" },
  { value: "disciplinary", label: "Disziplinarisch" },
  { value: "health", label: "Gesundheit" },
  { value: "career_development", label: "Karriereentwicklung" },
  { value: "other", label: "Sonstiges" },
];

export const HRNotesFilters = ({
  categoryFilter,
  setCategoryFilter,
  visibilityFilter,
  setVisibilityFilter,
  timeFilter,
  setTimeFilter,
  attachmentsOnly,
  setAttachmentsOnly,
}: HRNotesFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Alle Kategorien" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Alle Sichtbarkeiten" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Sichtbarkeiten</SelectItem>
          <SelectItem value="hr_only">Nur HR</SelectItem>
          <SelectItem value="hr_and_manager">HR & Manager</SelectItem>
        </SelectContent>
      </Select>

      <Select value={timeFilter} onValueChange={setTimeFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Alle Zeiträume" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Zeiträume</SelectItem>
          <SelectItem value="7days">Letzte 7 Tage</SelectItem>
          <SelectItem value="30days">Letzter Monat</SelectItem>
          <SelectItem value="1year">Letztes Jahr</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Checkbox
          id="attachments-only"
          checked={attachmentsOnly}
          onCheckedChange={(checked) => setAttachmentsOnly(checked as boolean)}
        />
        <Label htmlFor="attachments-only" className="cursor-pointer">
          Nur mit Anhängen
        </Label>
      </div>
    </div>
  );
};
