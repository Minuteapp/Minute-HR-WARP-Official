
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BusinessTripSkeleton = () => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-[300px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="mt-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6">
            <Skeleton className="h-6 w-[200px] mb-6" />
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-[150px] mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-[180px]" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessTripSkeleton;
