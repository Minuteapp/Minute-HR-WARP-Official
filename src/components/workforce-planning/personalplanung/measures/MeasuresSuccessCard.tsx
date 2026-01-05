import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface SuccessKPI {
  label: string;
  target: string;
  current: string;
}

interface MeasuresSuccessCardProps {
  kpis?: SuccessKPI[];
}

export const MeasuresSuccessCard = ({ kpis }: MeasuresSuccessCardProps) => {
  const defaultKPIs: SuccessKPI[] = [
    { label: 'Time-to-Hire', target: '3 Monate', current: '-' },
    { label: 'Training Success Rate', target: '85%', current: '-' },
    { label: 'Budget-Einhaltung', target: '±5%', current: '-' },
    { label: 'Employee Satisfaction', target: '80%', current: '-' }
  ];

  const displayKPIs = kpis && kpis.length > 0 ? kpis : defaultKPIs;

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2">Erfolgsmessung & KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayKPIs.map((kpi, index) => (
                <div key={index}>
                  <p className="text-sm font-medium text-green-800">{kpi.label}</p>
                  <p className="text-xs text-green-700">
                    Target: {kpi.target} | Aktuell: {kpi.current}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
