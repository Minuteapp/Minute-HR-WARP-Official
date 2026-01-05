import { Card } from "@/components/ui/card";

const PerformanceAnalytics = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Leistungsanalysen</h3>
          <p className="text-sm text-gray-500">Detaillierte Auswertungen und Statistiken</p>
        </div>
        <div className="text-center text-gray-500 py-8">
          Keine Analysedaten vorhanden
        </div>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;