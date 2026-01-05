import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useTenantModules } from "@/hooks/useTenantDetails";

interface TenantModuleLimitsTabProps {
  tenantId?: string;
}

export const TenantModuleLimitsTab = ({ tenantId }: TenantModuleLimitsTabProps) => {
  const { data, isLoading } = useTenantModules(tenantId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const activeModules = data?.activeModules || [];
  const limits = data?.limits || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Aktive Module ({activeModules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeModules.length === 0 ? (
            <p className="text-muted-foreground">Keine Module aktiviert</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeModules.map((module, index) => (
                <Badge key={index} variant="outline" className="border-primary text-primary">
                  {module}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-base">Feature-Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {limits.map((limit, index) => {
            const percentage = limit.max > 0 ? (limit.used / limit.max) * 100 : 0;
            const isWarning = percentage > 80;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{limit.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {limit.used} / {limit.max}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${isWarning ? "[&>div]:bg-orange-500" : "[&>div]:bg-green-500"}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};