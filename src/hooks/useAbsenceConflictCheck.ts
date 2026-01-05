import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: ConflictDetail[];
}

export interface ConflictDetail {
  type: 'blackout' | 'team_capacity' | 'holiday' | 'substitute_absent';
  severity: 'warning' | 'error';
  title: string;
  description: string;
  data?: any;
}

export const useAbsenceConflictCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkConflicts = async (
    startDate: string,
    endDate: string,
    department?: string,
    companyId?: string,
    substituteId?: string
  ): Promise<ConflictResult> => {
    setIsChecking(true);
    const conflicts: ConflictDetail[] = [];

    try {
      // 1. Blackout-Perioden prüfen
      const { data: blackouts } = await supabase
        .from('absence_blackout_periods')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', endDate)
        .gte('end_date', startDate);

      if (blackouts && blackouts.length > 0) {
        blackouts.forEach(blackout => {
          // Prüfe ob Department betroffen ist
          if (!blackout.department || blackout.department === department) {
            conflicts.push({
              type: 'blackout',
              severity: 'error',
              title: 'Urlaubssperre aktiv',
              description: `${blackout.reason}: ${new Date(blackout.start_date).toLocaleDateString('de-DE')} - ${new Date(blackout.end_date).toLocaleDateString('de-DE')}`,
              data: blackout
            });
          }
        });
      }

      // 2. Team-Kapazität prüfen (max. 30% gleichzeitig abwesend)
      if (department && companyId) {
        // Hole alle Mitarbeiter der Abteilung
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id')
          .eq('department', department)
          .eq('company_id', companyId)
          .eq('status', 'active');

        const teamSize = teamMembers?.length || 0;

        if (teamSize >= 3) {
          // Hole bereits genehmigte Abwesenheiten im Zeitraum
          const { data: existingAbsences } = await supabase
            .from('absence_requests')
            .select('user_id')
            .eq('status', 'approved')
            .eq('department', department)
            .lte('start_date', endDate)
            .gte('end_date', startDate);

          const absentCount = existingAbsences?.length || 0;
          const newAbsentCount = absentCount + 1;
          const capacityPercentage = (newAbsentCount / teamSize) * 100;

          if (capacityPercentage > 30) {
            conflicts.push({
              type: 'team_capacity',
              severity: 'warning',
              title: 'Hohe Team-Abwesenheit',
              description: `Mit diesem Antrag wären ${newAbsentCount} von ${teamSize} Teammitgliedern (${Math.round(capacityPercentage)}%) gleichzeitig abwesend.`,
              data: { absentCount: newAbsentCount, teamSize, percentage: capacityPercentage }
            });
          }
        }
      }

      // 3. Feiertage prüfen (Information, kein Konflikt)
      if (companyId) {
        const { data: holidays } = await supabase
          .from('absence_holidays')
          .select('*')
          .eq('company_id', companyId)
          .gte('holiday_date', startDate)
          .lte('holiday_date', endDate);

        if (holidays && holidays.length > 0) {
          const holidayNames = holidays.map(h => `${h.name} (${new Date(h.holiday_date).toLocaleDateString('de-DE')})`).join(', ');
          conflicts.push({
            type: 'holiday',
            severity: 'warning',
            title: 'Feiertage im Zeitraum',
            description: `Folgende Feiertage fallen in den gewählten Zeitraum: ${holidayNames}. Diese werden nicht als Urlaubstage gezählt.`,
            data: holidays
          });
        }
      }

      // 4. Vertretung prüfen (falls angegeben)
      if (substituteId) {
        const { data: substituteAbsences } = await supabase
          .from('absence_requests')
          .select('*')
          .eq('user_id', substituteId)
          .eq('status', 'approved')
          .lte('start_date', endDate)
          .gte('end_date', startDate);

        if (substituteAbsences && substituteAbsences.length > 0) {
          conflicts.push({
            type: 'substitute_absent',
            severity: 'error',
            title: 'Vertretung nicht verfügbar',
            description: 'Die ausgewählte Vertretung ist im gewählten Zeitraum selbst abwesend.',
            data: substituteAbsences[0]
          });
        }
      }

    } catch (error) {
      console.error('Fehler bei Konfliktprüfung:', error);
    } finally {
      setIsChecking(false);
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  };

  return {
    checkConflicts,
    isChecking
  };
};
