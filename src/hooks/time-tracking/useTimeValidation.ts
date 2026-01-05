
import { useToast } from "@/hooks/use-toast";
import { TimeEntry } from '@/types/time-tracking.types';
import { WorkTimeModel } from './useWorkTimeModels';

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export const useTimeValidation = () => {
  const { toast } = useToast();

  const validateTimeEntry = (
    startTime: Date,
    endTime: Date | null,
    breakMinutes: number,
    workModel: WorkTimeModel,
    existingEntries: TimeEntry[] = []
  ): ValidationResult => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!endTime) {
      return { isValid: true, warnings: [], errors: [], suggestions: [] };
    }

    const workDurationMs = endTime.getTime() - startTime.getTime();
    const workHours = (workDurationMs / (1000 * 60 * 60)) - (breakMinutes / 60);

    // Gesetzliche Validierungen
    if (workHours > 10) {
      errors.push('Maximale tägliche Arbeitszeit von 10 Stunden überschritten');
    } else if (workHours > 8) {
      warnings.push(`Normale Tagesarbeitszeit überschritten: ${workHours.toFixed(1)}h`);
    }

    // Pausenvalidierung
    if (workHours > 9 && breakMinutes < 45) {
      errors.push('Bei mehr als 9h Arbeitszeit sind mindestens 45 Min Pause gesetzlich vorgeschrieben');
    } else if (workHours > 6 && breakMinutes < 30) {
      errors.push('Bei mehr als 6h Arbeitszeit sind mindestens 30 Min Pause gesetzlich vorgeschrieben');
    }

    // Ruhezeit prüfen (11h zwischen Arbeitsende und -beginn)
    const lastEntry = existingEntries
      .filter(e => e.end_time && new Date(e.end_time).toDateString() !== startTime.toDateString())
      .sort((a, b) => new Date(b.end_time!).getTime() - new Date(a.end_time!).getTime())[0];

    if (lastEntry && lastEntry.end_time) {
      const lastEndTime = new Date(lastEntry.end_time);
      const restHours = (startTime.getTime() - lastEndTime.getTime()) / (1000 * 60 * 60);
      
      if (restHours < 11) {
        errors.push(`Mindestens 11h Ruhezeit nicht eingehalten (nur ${restHours.toFixed(1)}h)`);
      }
    }

    // Wochenarbeitszeit prüfen
    const currentWeekEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      const weekStart = new Date(startTime);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Montag
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // Sonntag
      
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const weeklyHours = currentWeekEntries.reduce((total, entry) => {
      if (!entry.end_time) return total;
      const entryHours = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60);
      const entryBreakHours = (entry.break_minutes || 0) / 60;
      return total + (entryHours - entryBreakHours);
    }, 0) + workHours;

    if (weeklyHours > 48) {
      errors.push(`Maximale Wochenarbeitszeit von 48h überschritten: ${weeklyHours.toFixed(1)}h`);
    } else if (weeklyHours > workModel.weeklyHours) {
      warnings.push(`Sollarbeitszeit überschritten: ${weeklyHours.toFixed(1)}h von ${workModel.weeklyHours}h`);
    }

    // Arbeitszeitmodell-spezifische Validierungen
    if (workModel.type === 'flex_time' && workModel.coreTimeStart && workModel.coreTimeEnd) {
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const endHour = endTime.getHours() + endTime.getMinutes() / 60;
      const coreStart = parseFloat(workModel.coreTimeStart.replace(':', '.'));
      const coreEnd = parseFloat(workModel.coreTimeEnd.replace(':', '.'));

      if (startHour > coreStart || endHour < coreEnd) {
        warnings.push(`Kernarbeitszeit nicht vollständig abgedeckt (${workModel.coreTimeStart}-${workModel.coreTimeEnd})`);
      }
    }

    // Vorschläge generieren
    if (workHours < workModel.dailyHours * 0.8) {
      suggestions.push('Arbeitszeit liegt unter der Sollzeit - prüfen Sie Ihre Planung');
    }

    if (breakMinutes === 0 && workHours > 4) {
      suggestions.push('Keine Pause eingetragen - vergessen Sie nicht Ihre Pausen zu dokumentieren');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      suggestions
    };
  };

  const showValidationToast = (result: ValidationResult) => {
    if (result.errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Gesetzesverstoß",
        description: result.errors.join('\n'),
      });
    } else if (result.warnings.length > 0) {
      toast({
        variant: "destructive",
        title: "Warnung",
        description: result.warnings.join('\n'),
      });
    } else if (result.suggestions.length > 0) {
      toast({
        title: "Hinweis",
        description: result.suggestions.join('\n'),
      });
    }
  };

  return {
    validateTimeEntry,
    showValidationToast
  };
};
