import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";

interface CareerHistorySectionProps {
  employee: Employee | null;
}

export const CareerHistorySection = ({ employee }: CareerHistorySectionProps) => {
  // No mock data - career history should be loaded from database
  const history: Array<{
    position: string;
    department: string;
    period: string;
    status: string;
    badge?: string;
    isCurrent: boolean;
  }> = [];

  return (
    <Card className="border-gray-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Karriere-Historie & Beförderungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Karriere-Historie vorhanden
          </p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${item.isCurrent ? 'bg-primary' : 'bg-gray-400'}`}></div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-300 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.badge && (
                        <Badge variant="secondary" className="mb-1 text-xs bg-gray-200">
                          {item.badge}
                        </Badge>
                      )}
                      <h4 className="font-semibold text-sm">{item.position}</h4>
                      <p className="text-xs text-muted-foreground">{item.department}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.period}</p>
                    </div>
                    <Badge 
                      variant={item.status === 'Erste Position' ? "outline" : "default"}
                      className={item.status !== 'Erste Position' ? "bg-black text-white" : ""}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
