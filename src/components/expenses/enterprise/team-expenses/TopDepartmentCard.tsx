
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface DepartmentCardData {
  rank: number;
  name: string;
  leader: string;
  employees: number;
  locations: number;
  budget: number;
  avgPerEmployee: number;
  totalExpenses: number;
  budgetDeviation: number;
  travelPercentage: number;
}

export interface TopDepartmentCardProps {
  department: DepartmentCardData;
}

const TopDepartmentCard = ({ department }: TopDepartmentCardProps) => {
  const formatCurrency = (num: number) => {
    if (num >= 1000000) {
      return `€${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `€${(num / 1000).toFixed(0)}K`;
    }
    return `€${num.toLocaleString('de-DE')}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
              {department.rank}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{department.name}</h4>
              <p className="text-sm text-muted-foreground">Leitung: {department.leader}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{formatCurrency(department.totalExpenses)}</p>
            <p className={`text-sm ${department.budgetDeviation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {department.budgetDeviation >= 0 ? '+' : ''}{department.budgetDeviation.toFixed(1)}% vs Budget
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Mitarbeiter</p>
            <p className="font-medium text-foreground">{department.employees}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Standorte</p>
            <p className="font-medium text-foreground">{department.locations}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-medium text-foreground">{formatCurrency(department.budget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ø pro MA</p>
            <p className="font-medium text-foreground">{formatCurrency(department.avgPerEmployee)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Progress value={department.travelPercentage} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Reise {department.travelPercentage}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopDepartmentCard;
