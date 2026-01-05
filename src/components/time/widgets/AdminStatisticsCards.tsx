import { Card } from "@/components/ui/card";
import { Clock, Calendar, Circle, Settings } from "lucide-react";

interface AdminStatisticsCardsProps {
  dailyHours: number;
  weeklyHours: number;
  status: 'online' | 'offline' | 'paused';
  role: string;
}

const AdminStatisticsCards = ({ dailyHours, weeklyHours, status, role }: AdminStatisticsCardsProps) => {
  const getStatusText = () => {
    if (status === 'online') return 'Online';
    if (status === 'paused') return 'Pausiert';
    return 'Offline';
  };

  const getStatusColor = () => {
    if (status === 'online') return 'text-green-600';
    if (status === 'paused') return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Heute */}
      <Card className="border-l-4 border-l-blue-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Heute</p>
            <p className="text-2xl font-bold mt-1">{dailyHours.toFixed(1)} h</p>
          </div>
          <Clock className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      {/* Diese Woche */}
      <Card className="border-l-4 border-l-yellow-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Diese Woche</p>
            <p className="text-2xl font-bold mt-1">{weeklyHours.toFixed(1)} h</p>
          </div>
          <Calendar className="h-8 w-8 text-orange-500" />
        </div>
      </Card>

      {/* Status */}
      <Card className="border-l-4 border-l-gray-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className={`text-2xl font-bold mt-1 ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
          <Circle className={`h-8 w-8 ${getStatusColor()}`} />
        </div>
      </Card>

      {/* Rolle */}
      <Card className="border-l-4 border-l-gray-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Rolle</p>
            <p className="text-2xl font-bold mt-1">{role}</p>
          </div>
          <Settings className="h-8 w-8 text-gray-600" />
        </div>
      </Card>
    </div>
  );
};

export default AdminStatisticsCards;
