
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Home, Baby, ClipboardList, Languages, CheckCircle } from 'lucide-react';

interface CategoryStat {
  category: string;
  total: number;
  completed: number;
}

interface RelocationInfoCardsProps {
  stats: CategoryStat[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Umzug': <Truck className="h-4 w-4" />,
  'Wohnung': <Home className="h-4 w-4" />,
  'Kinderbetreuung': <Baby className="h-4 w-4" />,
  'Anmeldung': <ClipboardList className="h-4 w-4" />,
  'Sprachkurs': <Languages className="h-4 w-4" />,
};

export function RelocationInfoCards({ stats }: RelocationInfoCardsProps) {
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {['Umzug', 'Wohnung', 'Kinderbetreuung', 'Anmeldung', 'Sprachkurs', 'Gesamt'].map((category) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {categoryIcons[category] || <CheckCircle className="h-4 w-4" />}
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">0 abgeschlossen</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {categoryIcons[stat.category] || <CheckCircle className="h-4 w-4" />}
              {stat.category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.total}</div>
            <p className="text-xs text-muted-foreground">{stat.completed} abgeschlossen</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
