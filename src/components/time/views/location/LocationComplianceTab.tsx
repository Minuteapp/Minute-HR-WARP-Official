import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckSquare } from "lucide-react";

const LocationComplianceTab = () => {
  const complianceItems: Array<{ name: string; percentage: number; openCases: number; badgeColor: string }> = [];

  const complianceOverview: Array<{ title: string; description: string; type: string; icon: any }> = [];

  return (
    <div className="space-y-6">
      {/* Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceItems.map((item, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{item.name}</h3>
              <span className={`px-2 py-1 ${item.badgeColor} text-white text-xs font-medium rounded-full`}>
                {item.percentage}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gray-900 rounded-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {item.openCases} offene Vorgänge
            </p>
          </Card>
        ))}
      </div>

      {/* Compliance Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Compliance Übersicht</h3>
        <div className="space-y-4">
          {complianceOverview.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${
                item.type === 'success' ? 'bg-green-50' : 'bg-yellow-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <item.icon className={`h-5 w-5 mt-0.5 ${
                  item.type === 'success' ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className={`text-sm ${
                    item.type === 'success' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LocationComplianceTab;
