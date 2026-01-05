
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import TopDepartmentCard from './TopDepartmentCard';
import BenchmarkComparisonChart from './BenchmarkComparisonChart';

interface DepartmentCardData {
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

interface BenchmarkData {
  department: string;
  current: number;
  industryBenchmark: number;
  target: number;
}

interface DepartmentsViewProps {
  departments: DepartmentCardData[];
  benchmarkData: BenchmarkData[];
}

const DepartmentsView = ({ departments, benchmarkData }: DepartmentsViewProps) => {
  if (departments.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Abteilungen nach Ausgaben</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine Abteilungsdaten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Departments Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Abteilungen nach Ausgaben</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((department) => (
            <TopDepartmentCard key={department.rank} department={department} />
          ))}
        </div>
      </div>

      {/* Benchmark Chart */}
      <BenchmarkComparisonChart data={benchmarkData} />
    </div>
  );
};

export default DepartmentsView;
