
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Bell, Play, Pause, Square, ChevronRight, Edit } from "lucide-react";
import { useTimeTracking } from '@/hooks/useTimeTracking';
import TimeTrackingDialog from '@/components/dialogs/TimeTrackingDialog';
import ManualTimeDialog from '@/components/time-tracking/ManualTimeDialog';

const MobileTimeView = () => {
  const { user } = useAuth();
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const timeTracking = useTimeTracking();

  const currentDate = new Date();
  const userName = user?.email?.split('@')[0] || 'Nolan Baptista';

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatHours = (hours: number) => {
    return Math.round(hours);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-bold">9:41</div>
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <div className="ml-2 w-6 h-3 border border-gray-900 rounded-sm">
              <div className="w-4 h-2 bg-gray-900 rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm text-gray-500 mb-1">{getGreeting()}</h1>
            <h2 className="text-xl font-semibold text-gray-900">{userName}</h2>
          </div>
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-6">
        {/* Stats Card */}
        <Card className="bg-gray-900 text-white p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Division</div>
              <div className="text-sm text-gray-400">Human Resource</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>Nov 28, 2023</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Work</div>
              <div className="text-2xl font-bold">{formatHours(timeTracking.dailyWorkHours)}</div>
              <div className="text-xs text-gray-400">Days</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Late</div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-gray-400">mins</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Overtime</div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-gray-400">Days</div>
            </div>
          </div>
        </Card>

        {/* Check In/Out Button */}
        {!timeTracking.isTracking ? (
          <div className="space-y-4">
            <Button
              onClick={() => setShowTimeDialog(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium"
            >
              <ChevronRight className="h-6 w-6" />
              Swipe To Check In
            </Button>
            
            <Button
              onClick={() => setShowManualDialog(true)}
              variant="outline"
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium border-gray-300"
            >
              <Edit className="h-6 w-6" />
              Zeit manuell erfassen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Timer Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {timeTracking.formatTime(timeTracking.elapsedTime)}
              </div>
              <div className="text-sm text-gray-500">
                {timeTracking.isPaused ? 'Pausiert' : 'Aktive Zeiterfassung'}
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={timeTracking.handlePauseResume}
                size="lg"
                variant={timeTracking.isPaused ? "default" : "outline"}
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                {timeTracking.isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
              </Button>
              
              <Button
                onClick={timeTracking.handleStop}
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                <Square className="h-8 w-8" />
              </Button>
            </div>
            
            {/* Check Out Button */}
            <Button
              onClick={timeTracking.handleStop}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium"
            >
              <ChevronRight className="h-6 w-6" />
              Swipe To Check Out
            </Button>
          </div>
        )}

        {/* Check In/Out Times */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <span className="text-sm font-medium">Check In</span>
            </div>
            <div className="text-lg font-bold">
              {timeTracking.trackingStartTime ? format(timeTracking.trackingStartTime, 'HH:mm') : '09:00'} am
            </div>
            <div className="text-xs text-gray-500">On Time</div>
          </Card>
          
          <Card className="p-4 bg-white rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <span className="text-sm font-medium">Check Out</span>
            </div>
            <div className="text-lg font-bold">00:00 pm</div>
            <div className="text-xs text-gray-500">Go Home</div>
          </Card>
        </div>

        {/* Today's Attendance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Attendance</h3>
            <Button variant="ghost" className="text-purple-500 text-sm">
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <div>
                <div className="text-sm font-medium">Total Employee</div>
                <div className="text-2xl font-bold">100 <span className="text-sm font-normal text-gray-500">People</span></div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <div>
                <div className="text-sm font-medium">Sick</div>
                <div className="text-2xl font-bold">10 <span className="text-sm font-normal text-gray-500">People</span></div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <div>
                <div className="text-sm font-medium">Attendance</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <div>
                <div className="text-sm font-medium">off work</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-around items-center">
          <div className="w-8 h-8 bg-purple-500 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Time Tracking Dialog */}
      <TimeTrackingDialog
        open={showTimeDialog}
        onOpenChange={setShowTimeDialog}
        mode="start"
        onSuccess={() => {
          setShowTimeDialog(false);
        }}
      />
      
      {/* Manual Time Dialog */}
      <ManualTimeDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        onSuccess={() => {
          setShowManualDialog(false);
        }}
      />
    </div>
  );
};

export default MobileTimeView;
