import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  ThumbsUp, 
  Bot,
  BarChart3
} from "lucide-react";

export const NewOverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-orange-50 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Umfragen</p>
                <p className="text-3xl font-bold text-orange-600">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-violet-50 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Teilnahmequote</p>
                <p className="text-3xl font-bold text-violet-600">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement-Score</p>
                <p className="text-3xl font-bold text-blue-600">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">eNPS</p>
                <p className="text-3xl font-bold text-green-600">—</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary Box */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-violet-900 mb-1">KI-Zusammenfassung</p>
              <p className="text-sm text-violet-800">
                Keine Umfragedaten verfügbar. Erstellen Sie eine Umfrage, um hier Auswertungen zu sehen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State for Charts */}
      <Card>
        <CardContent className="py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Daten verfügbar</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Sobald Umfragen durchgeführt wurden, werden hier Trends, Stärken-Profile und Team-Analysen angezeigt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
