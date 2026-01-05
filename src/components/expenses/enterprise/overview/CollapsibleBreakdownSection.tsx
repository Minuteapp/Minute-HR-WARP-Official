
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface BreakdownItem {
  label: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
  badgeColor?: string;
}

interface CollapsibleBreakdownSectionProps {
  title: string;
  itemCount: number;
  items?: BreakdownItem[];
  defaultOpen?: boolean;
}

const getBadgeClasses = (badgeColor?: string) => {
  switch (badgeColor) {
    case 'green':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'purple':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'cyan':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'gray':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'red':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'blue':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getProgressColor = (color: string) => {
  switch (color) {
    case 'purple':
      return 'bg-purple-500';
    case 'green':
      return 'bg-green-500';
    case 'blue':
      return 'bg-blue-500';
    case 'red':
      return 'bg-red-500';
    case 'cyan':
      return 'bg-cyan-500';
    default:
      return 'bg-purple-500';
  }
};

const CollapsibleBreakdownSection = ({ 
  title, 
  itemCount, 
  items = [],
  defaultOpen = false 
}: CollapsibleBreakdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <span className="text-sm text-muted-foreground">{itemCount} {title.includes('Status') ? 'Status' : title.includes('Kategorie') ? 'Kategorien' : title.includes('Zahlungsart') ? 'Arten' : 'Abteilungen'}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-3">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getBadgeClasses(item.badgeColor)}>
                      {item.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{item.count.toLocaleString()}</span>
                    <span className="font-medium text-foreground w-24 text-right">{formatCurrency(item.amount)}</span>
                    <span className="w-12 text-right">{item.percentage}%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full rounded-full ${getProgressColor(item.color)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Daten verfügbar
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleBreakdownSection;
