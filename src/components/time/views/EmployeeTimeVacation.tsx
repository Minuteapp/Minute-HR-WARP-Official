import { Card } from "@/components/ui/card";
import { Umbrella, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const EmployeeTimeVacation = () => {
  return (
    <div className="space-y-6">
      {/* 3 Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Urlaubsanspruch */}
        <Card className="border-l-4 border-l-blue-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Urlaubsanspruch</p>
              <p className="text-2xl font-bold mt-1">-- Tage</p>
              <p className="text-xs text-gray-500 mt-1">Pro Jahr</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        {/* Genommen */}
        <Card className="border-l-4 border-l-orange-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Genommen</p>
              <p className="text-2xl font-bold mt-1">-- Tage</p>
              <p className="text-xs text-gray-500 mt-1">--</p>
            </div>
            <CheckCircle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        {/* Verbleibend */}
        <Card className="border-l-4 border-l-green-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Verbleibend</p>
              <p className="text-2xl font-bold mt-1">-- Tage</p>
              <p className="text-xs text-gray-500 mt-1">Noch verfügbar</p>
            </div>
            <Umbrella className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Urlaubsübersicht */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Urlaubsübersicht</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Urlaubsnutzung</span>
              <span className="font-medium">-- / -- Tage (--)</span>
            </div>
            <Progress value={0} className="h-3" />
          </div>

          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Krankheitstage dieses Jahr</p>
              <p className="text-sm text-yellow-700">-- Tage</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeTimeVacation;
