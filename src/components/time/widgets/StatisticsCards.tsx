import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Settings } from 'lucide-react';

interface StatisticsCardsProps {
  currentTime?: string;
  dailyWorkHours: number;
  weeklyWorkHours: number;
  status: 'online' | 'offline' | 'paused';
}

const StatisticsCards = ({ currentTime, dailyWorkHours, weeklyWorkHours, status }: StatisticsCardsProps) => {
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatHours = (hours: number) => {
    return hours.toFixed(1) + ' h';
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'paused': return 'Pausiert';
      default: return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Aktuelle Zeit */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Aktuelle Zeit</CardTitle>
          <Clock className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {liveTime.toLocaleTimeString('de-DE')}
          </div>
        </CardContent>
      </Card>

      {/* Arbeitszeit Heute */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Arbeitszeit Heute</CardTitle>
          <Clock className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatHours(dailyWorkHours)}
          </div>
        </CardContent>
      </Card>

      {/* Diese Woche */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Diese Woche</CardTitle>
          <Clock className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatHours(weeklyWorkHours)}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Status</CardTitle>
          <Settings className="h-5 w-5 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
