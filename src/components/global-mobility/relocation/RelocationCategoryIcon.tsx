
import { Truck, Home, Baby, ClipboardList, Languages } from 'lucide-react';

interface RelocationCategoryIconProps {
  category: string;
  className?: string;
}

export function RelocationCategoryIcon({ category, className = "h-4 w-4" }: RelocationCategoryIconProps) {
  switch (category.toLowerCase()) {
    case 'umzug':
      return <Truck className={className} />;
    case 'wohnung':
      return <Home className={className} />;
    case 'kinderbetreuung':
      return <Baby className={className} />;
    case 'anmeldung':
      return <ClipboardList className={className} />;
    case 'sprachkurs':
      return <Languages className={className} />;
    default:
      return <ClipboardList className={className} />;
  }
}
