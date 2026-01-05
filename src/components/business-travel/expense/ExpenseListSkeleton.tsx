
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ExpenseListSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExpenseListSkeleton;
