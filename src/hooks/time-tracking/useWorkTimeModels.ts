
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface WorkTimeModel {
  id: string;
  name: string;
  type: 'flex_time' | 'fixed_time' | 'trust_time' | 'shift_work' | 'part_time' | 'on_call' | 'industry_specific';
  dailyHours: number;
  weeklyHours: number;
  coreTimeStart?: string;
  coreTimeEnd?: string;
  flexTimeStart?: string;
  flexTimeEnd?: string;
  breakRules: {
    minBreakAfter6h: number; // in minutes
    minBreakAfter9h: number; // in minutes
  };
  maxDailyHours: number;
  maxWeeklyHours: number;
  industry?: 'healthcare' | 'construction' | 'hospitality' | 'administration' | 'it' | 'general';
  shiftPattern?: string[];
  isActive: boolean;
}

export const DEFAULT_WORK_TIME_MODELS: WorkTimeModel[] = [
  {
    id: 'flex-standard',
    name: 'Gleitzeit Standard (40h/Woche)',
    type: 'flex_time',
    dailyHours: 8,
    weeklyHours: 40,
    coreTimeStart: '09:00',
    coreTimeEnd: '15:00',
    flexTimeStart: '06:00',
    flexTimeEnd: '20:00',
    breakRules: { minBreakAfter6h: 30, minBreakAfter9h: 45 },
    maxDailyHours: 10,
    maxWeeklyHours: 48,
    isActive: true
  },
  {
    id: 'fixed-standard',
    name: 'Feste Arbeitszeiten (8-17 Uhr)',
    type: 'fixed_time',
    dailyHours: 8,
    weeklyHours: 40,
    flexTimeStart: '08:00',
    flexTimeEnd: '17:00',
    breakRules: { minBreakAfter6h: 30, minBreakAfter9h: 45 },
    maxDailyHours: 10,
    maxWeeklyHours: 48,
    isActive: true
  },
  {
    id: 'trust-work',
    name: 'Vertrauensarbeitszeit',
    type: 'trust_time',
    dailyHours: 8,
    weeklyHours: 40,
    breakRules: { minBreakAfter6h: 30, minBreakAfter9h: 45 },
    maxDailyHours: 12,
    maxWeeklyHours: 60,
    isActive: true
  },
  {
    id: 'healthcare-shift',
    name: 'Pflege - Schichtdienst',
    type: 'shift_work',
    dailyHours: 8,
    weeklyHours: 38.5,
    industry: 'healthcare',
    shiftPattern: ['Frühdienst (06:00-14:00)', 'Spätdienst (14:00-22:00)', 'Nachtdienst (22:00-06:00)'],
    breakRules: { minBreakAfter6h: 30, minBreakAfter9h: 45 },
    maxDailyHours: 12,
    maxWeeklyHours: 48,
    isActive: true
  },
  {
    id: 'part-time-20',
    name: 'Teilzeit 20h/Woche',
    type: 'part_time',
    dailyHours: 4,
    weeklyHours: 20,
    breakRules: { minBreakAfter6h: 30, minBreakAfter9h: 45 },
    maxDailyHours: 8,
    maxWeeklyHours: 48,
    isActive: true
  }
];

export const useWorkTimeModels = () => {
  const [workTimeModels, setWorkTimeModels] = useState<WorkTimeModel[]>(DEFAULT_WORK_TIME_MODELS);
  const [selectedModel, setSelectedModel] = useState<WorkTimeModel | null>(null);
  const { toast } = useToast();

  const validateWorkingHours = (hours: number, model: WorkTimeModel): { isValid: boolean; warnings: string[]; errors: string[] } => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Gesetzliche Tagesgrenze (10h erweitert, 8h normal)
    if (hours > model.maxDailyHours) {
      errors.push(`Maximale Tagesarbeitszeit von ${model.maxDailyHours}h überschritten`);
    } else if (hours > 8) {
      warnings.push(`Normale Tagesarbeitszeit von 8h überschritten (${hours.toFixed(1)}h)`);
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  };

  const validateBreakTime = (workHours: number, breakMinutes: number, model: WorkTimeModel): { isValid: boolean; message: string } => {
    if (workHours > 9 && breakMinutes < model.breakRules.minBreakAfter9h) {
      return {
        isValid: false,
        message: `Bei mehr als 9h Arbeitszeit sind mindestens ${model.breakRules.minBreakAfter9h} Min Pause gesetzlich vorgeschrieben`
      };
    }

    if (workHours > 6 && breakMinutes < model.breakRules.minBreakAfter6h) {
      return {
        isValid: false,
        message: `Bei mehr als 6h Arbeitszeit sind mindestens ${model.breakRules.minBreakAfter6h} Min Pause gesetzlich vorgeschrieben`
      };
    }

    return { isValid: true, message: '' };
  };

  const getRecommendations = (weeklyHours: number, model: WorkTimeModel): string[] => {
    const recommendations: string[] = [];

    if (weeklyHours > model.maxWeeklyHours) {
      recommendations.push('Wöchentliche Höchstarbeitszeit überschritten - Überstundenabbau empfohlen');
    }

    if (model.type === 'flex_time' && weeklyHours < model.weeklyHours * 0.8) {
      recommendations.push('Gleitzeitsaldo niedrig - Mehrarbeit zur Kompensation empfohlen');
    }

    return recommendations;
  };

  const createCustomModel = (modelData: Partial<WorkTimeModel>): WorkTimeModel => {
    const newModel: WorkTimeModel = {
      id: `custom-${Date.now()}`,
      name: modelData.name || 'Benutzerdefiniertes Modell',
      type: modelData.type || 'flex_time',
      dailyHours: modelData.dailyHours || 8,
      weeklyHours: modelData.weeklyHours || 40,
      breakRules: modelData.breakRules || { minBreakAfter6h: 30, minBreakAfter9h: 45 },
      maxDailyHours: modelData.maxDailyHours || 10,
      maxWeeklyHours: modelData.maxWeeklyHours || 48,
      isActive: true,
      ...modelData
    };

    setWorkTimeModels(prev => [...prev, newModel]);
    
    toast({
      title: "Arbeitszeitmodell erstellt",
      description: `Das Modell "${newModel.name}" wurde erfolgreich erstellt.`,
    });

    return newModel;
  };

  return {
    workTimeModels,
    selectedModel,
    setSelectedModel,
    validateWorkingHours,
    validateBreakTime,
    getRecommendations,
    createCustomModel
  };
};
