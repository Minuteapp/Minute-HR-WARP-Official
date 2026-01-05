import { TimeEntry } from '@/types/time-tracking.types';
import { parseISO, differenceInHours } from 'date-fns';

export interface Recommendation {
  icon: string;
  title: string;
  description: string;
}

const calculateTimeVariance = (entries: TimeEntry[]): number => {
  const hours = entries.map(entry => {
    if (!entry.start_time || !entry.end_time) return 0;
    const start = parseISO(entry.start_time);
    const end = parseISO(entry.end_time);
    return differenceInHours(end, start) - ((entry.break_minutes || 0) / 60);
  });
  
  if (hours.length === 0) return 0;
  
  const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  const variance = hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length;
  
  return Math.sqrt(variance);
};

const calculateAvgBreakTime = (entries: TimeEntry[]): number => {
  const totalBreakMinutes = entries.reduce((sum, entry) => sum + (entry.break_minutes || 0), 0);
  return entries.length > 0 ? totalBreakMinutes / entries.length : 0;
};

const calculateHomeOfficePercentage = (entries: TimeEntry[]): number => {
  const homeOfficeCount = entries.filter(entry => 
    entry.location?.toLowerCase().includes('home') || 
    entry.location?.toLowerCase().includes('office')
  ).length;
  
  return entries.length > 0 ? (homeOfficeCount / entries.length) * 100 : 0;
};

export const generateRecommendations = (entries: TimeEntry[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  if (entries.length === 0) {
    return [{
      icon: "📊",
      title: "Mehr Daten sammeln",
      description: "Erfassen Sie regelmäßig Ihre Arbeitszeiten, um personalisierte Empfehlungen zu erhalten."
    }];
  }
  
  // Konsistenz-Check
  const variance = calculateTimeVariance(entries);
  if (variance > 2) {
    recommendations.push({
      icon: "📊",
      title: "Konsistenz verbessern",
      description: "Versuchen Sie, täglich ähnliche Arbeitszeiten einzuhalten für bessere Work-Life-Balance"
    });
  }
  
  // Pausen-Check
  const avgBreakTime = calculateAvgBreakTime(entries);
  if (avgBreakTime < 30) {
    recommendations.push({
      icon: "☕",
      title: "Pausenzeiten optimieren",
      description: "Regelmäßige Pausen erhöhen die Produktivität um bis zu 20%"
    });
  }
  
  // Home Office-Check
  const homeOfficePercentage = calculateHomeOfficePercentage(entries);
  if (homeOfficePercentage < 20) {
    recommendations.push({
      icon: "🏠",
      title: "Home Office nutzen",
      description: "An Tagen mit fokussierter Arbeit kann Home Office effizienter sein"
    });
  }
  
  // Überstunden-Check
  const avgHours = entries.reduce((sum, entry) => {
    if (!entry.start_time || !entry.end_time) return sum;
    const start = parseISO(entry.start_time);
    const end = parseISO(entry.end_time);
    return sum + differenceInHours(end, start) - ((entry.break_minutes || 0) / 60);
  }, 0) / entries.length;
  
  if (avgHours > 9) {
    recommendations.push({
      icon: "⚠️",
      title: "Arbeitszeiten reduzieren",
      description: "Überstunden können langfristig zu Erschöpfung führen. Achten Sie auf ausreichende Erholung."
    });
  }
  
  // Wenn alles gut läuft
  if (recommendations.length === 0) {
    recommendations.push({
      icon: "✅",
      title: "Hervorragend!",
      description: "Ihre Arbeitsmuster sind ausgewogen und produktiv. Weiter so!"
    });
  }
  
  return recommendations;
};
