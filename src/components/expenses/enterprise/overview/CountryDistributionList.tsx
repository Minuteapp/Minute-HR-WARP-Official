
interface CountryItem {
  country: string;
  employees: number;
  color: string;
}

interface CountryDistributionListProps {
  countries?: CountryItem[];
}

const CountryDistributionList = ({ countries = [] }: CountryDistributionListProps) => {
  if (countries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Keine Länderdaten verfügbar
      </div>
    );
  }

  // Split into two columns
  const midpoint = Math.ceil(countries.length / 2);
  const leftColumn = countries.slice(0, midpoint);
  const rightColumn = countries.slice(midpoint);

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        {leftColumn.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground">{item.country}:</span>
            <span className="text-muted-foreground">{item.employees.toLocaleString()} MA</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {rightColumn.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground">{item.country}:</span>
            <span className="text-muted-foreground">{item.employees.toLocaleString()} MA</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryDistributionList;
