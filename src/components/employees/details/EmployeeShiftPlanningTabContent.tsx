import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, List, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployeeShifts, TimeRange } from '@/hooks/shift-planning/useEmployeeShifts';
import { ShiftListView } from './shift-planning/ShiftListView';
import { ShiftStatisticsCards } from './shift-planning/ShiftStatisticsCards';
import { ShiftSwapRequestsCard } from './shift-planning/ShiftSwapRequestsCard';
import { ShiftTypesOverviewCard } from './shift-planning/ShiftTypesOverviewCard';
import { ShiftAIRecommendations } from './shift-planning/ShiftAIRecommendations';
import { ShiftGuidelines } from './shift-planning/ShiftGuidelines';
import { Skeleton } from '@/components/ui/skeleton';

interface EmployeeShiftPlanningTabContentProps {
  employeeId: string;
}

export const EmployeeShiftPlanningTabContent = ({ employeeId }: EmployeeShiftPlanningTabContentProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('next_14_days');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const { shifts, groupedShifts, statistics, shiftTypeDistribution, isLoading } = 
    useEmployeeShifts(employeeId, timeRange);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mein Schichtplan</h2>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next_14_days">Nächste 14 Tage</SelectItem>
              <SelectItem value="this_week">Diese Woche</SelectItem>
              <SelectItem value="this_month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 border-b">
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="rounded-b-none"
        >
          <List className="w-4 h-4 mr-2" />
          Liste
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className="rounded-b-none"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Kalender
        </Button>
      </div>

      {/* Shift List/Calendar View */}
      {viewMode === 'list' ? (
        <ShiftListView groupedShifts={groupedShifts} />
      ) : (
        <div className="p-8 text-center border rounded-lg bg-muted/50">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Kalender-Ansicht wird bald verfügbar sein</p>
        </div>
      )}

      {/* Statistics Cards */}
      <ShiftStatisticsCards statistics={statistics} />

      {/* Bottom Section: Swap Requests and Shift Types Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShiftSwapRequestsCard />
        <ShiftTypesOverviewCard distribution={shiftTypeDistribution} />
      </div>

      {/* KI-Empfehlungen */}
      <ShiftAIRecommendations />

      {/* Richtlinien */}
      <ShiftGuidelines />
    </div>
  );
};
