
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CompanyDetailsSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    </Card>
  );
};
