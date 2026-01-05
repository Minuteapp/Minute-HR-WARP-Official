import TopDepartmentCard, { DepartmentCardData } from './TopDepartmentCard';
import BenchmarkComparisonChart, { BenchmarkData } from './BenchmarkComparisonChart';

interface CategoryViewProps {
  topDepartments?: DepartmentCardData[];
  benchmarkData?: BenchmarkData[];
}

const CategoryView = ({ topDepartments = [], benchmarkData = [] }: CategoryViewProps) => {
  return (
    <div className="space-y-6">
      {/* Top Departments Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top-Ausgaben nach Abteilung</h3>
          <p className="text-sm text-muted-foreground">Abteilungen mit höchsten absoluten Ausgaben</p>
        </div>
        {topDepartments.length > 0 ? (
          <div className="space-y-4">
            {topDepartments.map((dept) => (
              <TopDepartmentCard key={dept.rank} department={dept} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Keine Abteilungsdaten vorhanden</p>
          </div>
        )}
      </div>

      {/* Benchmark Chart Section */}
      <BenchmarkComparisonChart data={benchmarkData} />
    </div>
  );
};

export default CategoryView;
