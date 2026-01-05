
import { Card } from "@/components/ui/card";

const AbsenceRequests = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Abwesenheitsanträge</h2>
        <p className="text-sm text-gray-500">Verwalten Sie Anträge für Urlaub, Krankheit und andere Abwesenheiten</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Keine ausstehenden Anträge.</p>
        </div>
      </Card>
    </div>
  );
};

export default AbsenceRequests;
