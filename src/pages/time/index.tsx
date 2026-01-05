
import { useIsMobile } from '@/hooks/use-device-type';
import MobileEmployeeTimeView from '@/components/time/mobile/MobileEmployeeTimeView';
import TimeTrackingDashboard from '@/components/time/TimeTrackingDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import TimeTrackingErrorBoundary from '@/components/time-tracking/TimeTrackingErrorBoundary';
import { TimeTrackingLoadingState } from '@/components/time-tracking/TimeTrackingLoadingState';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { timeTrackingService } from '@/services/timeTrackingService';

const TimePage = () => {
  const isMobile = useIsMobile();
  const authContext = useAuth?.() || null;
  const user = authContext?.user;

  const { data: activeEntry, error } = useQuery({
    queryKey: ['activeTimeEntry', user?.id],
    queryFn: () => timeTrackingService.getActiveTimeEntryForUser(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 5000,
    retry: 1
  });
  
  if (isMobile) {
    return (
      <TimeTrackingErrorBoundary>
        <Suspense fallback={<TimeTrackingLoadingState message="Mobile Ansicht wird geladen..." />}>
          <MobileEmployeeTimeView />
        </Suspense>
      </TimeTrackingErrorBoundary>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-red-700">Verbindungsfehler</h3>
                <p className="text-red-600">Die Zeiterfassung konnte nicht geladen werden.</p>
                <p className="text-sm text-gray-600 mt-2">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TimeTrackingErrorBoundary>
      <Suspense fallback={<TimeTrackingLoadingState />}>
        <TimeTrackingDashboard />
      </Suspense>
    </TimeTrackingErrorBoundary>
  );
};

export default TimePage;
