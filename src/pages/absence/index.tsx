
import { useState } from 'react';
import { ModernAbsenceDashboard } from '@/components/absence/modern/ModernAbsenceDashboard';
import { Calendar as CalendarIcon, ListFilter, RefreshCw, Settings, Users, BarChart } from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { addMonths, format, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AbsenceList } from '@/components/absence/AbsenceList';
import { AbsenceStatisticsView } from '@/components/absence/AbsenceStatisticsView';
import { AbsenceSettingsForm } from '@/components/absence/AbsenceSettingsForm';
import AbsenceTeamView from '@/components/absence/AbsenceTeamView';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import ShiftRequestDialog from '@/components/absence/ShiftRequestDialog';

const AbsencePage = () => {
  return <ModernAbsenceDashboard />;
};

export default AbsencePage;
