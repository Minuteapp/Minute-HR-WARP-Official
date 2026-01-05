
import { useTripManagement } from './useTripManagement';
import { useExpenseManagement } from './useExpenseManagement';
import { useReportManagement } from './useReportManagement';

export const useBusinessTravel = (tripId?: string) => {
  const tripManagement = useTripManagement(tripId);
  const expenseManagement = useExpenseManagement(tripId || '');
  const reportManagement = useReportManagement(tripId || '');

  return {
    ...tripManagement,
    ...expenseManagement,
    ...reportManagement
  };
};
