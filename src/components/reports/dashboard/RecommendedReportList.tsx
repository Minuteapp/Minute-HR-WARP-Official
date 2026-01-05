
import { FileBarChart, ArrowRight, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecommendedReportList = () => {
  const recommendedReports = [
    {
      id: 1,
      title: "Überstundenanalyse (Q2)",
      description: "Eine Analyse der Überstunden im Vertrieb zeigt einen Anstieg von 23%",
      icon: <Activity className="h-10 w-10 text-blue-500" />,
      importance: "hoch",
      timestamp: "Automatisch generiert • Heute"
    },
    {
      id: 2,
      title: "Mitarbeiterauslastung",
      description: "Die Auslastung im Entwicklungsteam liegt über dem empfohlenen Niveau",
      icon: <Clock className="h-10 w-10 text-amber-500" />,
      importance: "mittel",
      timestamp: "Basierend auf Ihren Interessen"
    },
    {
      id: 3,
      title: "Projektkosten nach Abteilung",
      description: "Vergleich der Projektkosten der letzten 3 Quartale",
      icon: <FileBarChart className="h-10 w-10 text-green-500" />,
      importance: "niedrig",
      timestamp: "Empfohlen für Ihre Rolle"
    }
  ];

  return (
    <div className="space-y-0">
      {recommendedReports.map((report) => (
        <div key={report.id} className="flex items-start p-4 hover:bg-gray-50 border-b">
          <div className="mr-4 mt-1">{report.icon}</div>
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className="font-medium text-sm">{report.title}</h4>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                report.importance === 'hoch' ? 'bg-red-100 text-red-800' : 
                report.importance === 'mittel' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}>
                {report.importance}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{report.description}</p>
            <div className="mt-2 text-xs text-muted-foreground">{report.timestamp}</div>
            <div className="mt-2">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                Bericht generieren <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="p-4 text-center">
        <Button variant="outline" size="sm">
          Alle Empfehlungen anzeigen
        </Button>
      </div>
    </div>
  );
};

export default RecommendedReportList;
