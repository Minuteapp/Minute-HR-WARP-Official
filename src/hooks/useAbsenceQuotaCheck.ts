import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QuotaStatus {
  hasQuota: boolean;
  totalDays: number;
  usedDays: number;
  plannedDays: number;
  remainingDays: number;
  carryoverDays: number;
  carryoverExpiresAt?: string;
  requestedDays: number;
  willExceed: boolean;
  exceededBy: number;
}

export const useAbsenceQuotaCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const calculateWorkingDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  };

  const checkQuota = async (
    employeeId: string,
    absenceType: string,
    startDate: string,
    endDate: string,
    isHalfDay: boolean = false
  ): Promise<QuotaStatus | null> => {
    setIsChecking(true);

    try {
      // Nur für Urlaubsarten prüfen
      const vacationTypes = ['vacation', 'special_vacation', 'regular_vacation'];
      if (!vacationTypes.includes(absenceType)) {
        return null; // Keine Kontingentprüfung für Krankheit, Homeoffice etc.
      }

      const currentYear = new Date().getFullYear();

      // Lade Quota aus absence_quotas
      const { data: quota } = await supabase
        .from('absence_quotas')
        .select('*')
        .eq('user_id', employeeId)
        .eq('absence_type', 'vacation')
        .eq('quota_year', currentYear)
        .maybeSingle();

      // Fallback: Lade aus employees wenn kein Quota existiert
      const { data: employee } = await supabase
        .from('employees')
        .select('vacation_days')
        .eq('id', employeeId)
        .maybeSingle();

      const totalDays = quota?.total_days || employee?.vacation_days || 30;
      const usedDays = quota?.used_days || 0;
      const plannedDays = quota?.planned_days || 0;
      const carryoverDays = quota?.carryover_days || 0;
      const carryoverExpiresAt = quota?.carryover_valid_until;

      // Berechne beantragte Tage
      let requestedDays = calculateWorkingDays(startDate, endDate);
      if (isHalfDay) {
        requestedDays = 0.5;
      }

      // Berechne verbleibende Tage (inkl. Übertrag)
      const availableDays = totalDays + carryoverDays - usedDays - plannedDays;
      const remainingAfterRequest = availableDays - requestedDays;
      const willExceed = remainingAfterRequest < 0;
      const exceededBy = willExceed ? Math.abs(remainingAfterRequest) : 0;

      return {
        hasQuota: true,
        totalDays,
        usedDays,
        plannedDays,
        remainingDays: availableDays,
        carryoverDays,
        carryoverExpiresAt,
        requestedDays,
        willExceed,
        exceededBy
      };
    } catch (error) {
      console.error('Fehler bei Kontingentprüfung:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkQuota,
    isChecking
  };
};
