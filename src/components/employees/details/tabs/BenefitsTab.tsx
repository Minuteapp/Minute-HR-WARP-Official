import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeBenefitsData } from "@/integrations/supabase/hooks/useEmployeeBenefits";
import { CorporateBenefitsPortal } from "./benefits/CorporateBenefitsPortal";
import { AllowancesCard } from "./benefits/AllowancesCard";
import { ChildcareCard } from "./benefits/ChildcareCard";
import { FitnessCard } from "./benefits/FitnessCard";
import { EmployeeDiscountsCard } from "./benefits/EmployeeDiscountsCard";
import { VLCard } from "./benefits/VLCard";

interface BenefitsTabProps {
  employeeId: string;
}

export const BenefitsTab = ({ employeeId }: BenefitsTabProps) => {
  const { data: benefits, isLoading } = useEmployeeBenefitsData(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorporateBenefitsPortal />
        <AllowancesCard allowances={benefits?.allowances || []} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChildcareCard childcare={benefits?.childcare} />
        <FitnessCard fitness={benefits?.fitness} />
      </div>
      
      <EmployeeDiscountsCard discounts={benefits?.discounts} />
      
      <VLCard vl={benefits?.vl} />
    </div>
  );
};
