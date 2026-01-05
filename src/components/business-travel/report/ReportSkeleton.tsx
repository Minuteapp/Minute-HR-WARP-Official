
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ReportSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </Card>
  );
};

export default ReportSkeleton;
