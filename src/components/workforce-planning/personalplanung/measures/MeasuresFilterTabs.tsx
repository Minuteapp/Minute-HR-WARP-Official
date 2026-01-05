import { Button } from "@/components/ui/button";

interface MeasuresFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    inProgress: number;
    planned: number;
    highPriority: number;
  };
}

export const MeasuresFilterTabs = ({ activeFilter, onFilterChange, counts }: MeasuresFilterTabsProps) => {
  const filters = [
    { key: 'all', label: 'Alle', count: counts.all },
    { key: 'inProgress', label: 'In Bearbeitung', count: counts.inProgress },
    { key: 'planned', label: 'Geplant', count: counts.planned },
    { key: 'highPriority', label: 'Hohe Priorität', count: counts.highPriority },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          className={activeFilter === filter.key ? "bg-purple-600 hover:bg-purple-700" : ""}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label} ({filter.count})
        </Button>
      ))}
    </div>
  );
};
