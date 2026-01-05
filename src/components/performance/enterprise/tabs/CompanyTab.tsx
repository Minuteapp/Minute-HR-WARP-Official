import { CompanyPerformanceHeader } from "../company/CompanyPerformanceHeader";
import { DimensionWeightCards } from "../company/DimensionWeightCards";
import { TopDepartmentsChart } from "../company/TopDepartmentsChart";
import { PerformanceDistributionChart } from "../company/PerformanceDistributionChart";
import { DimensionsDetailChart } from "../company/DimensionsDetailChart";
import { DepartmentsList } from "../company/DepartmentsList";
import { DevelopmentInsightsBox } from "../company/DevelopmentInsightsBox";

export function CompanyTab() {
  return (
    <div className="space-y-6">
      <CompanyPerformanceHeader />
      
      <DimensionWeightCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDepartmentsChart />
        <PerformanceDistributionChart />
      </div>

      <DimensionsDetailChart />

      <DevelopmentInsightsBox />

      <DepartmentsList />
    </div>
  );
}
