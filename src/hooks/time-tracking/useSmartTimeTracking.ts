
import { useEffect, useState } from 'react';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useLocationZones } from '@/hooks/location-zones/useLocationZones';
import { useAiTimeTracking } from './useAiTimeTracking';
import { useToast } from '@/hooks/use-toast';
import { useEffectiveTimeRules } from './useEffectiveTimeRules';

export const useSmartTimeTracking = () => {
  const timeTracking = useTimeTracking();
  const { currentDetection, zones } = useLocationZones();
  const aiTimeTracking = useAiTimeTracking(timeTracking.currentActiveEntry);
  const [autoStartEnabled, setAutoStartEnabled] = useState(true);
  const [smartProjectAssignment, setSmartProjectAssignment] = useState(true);
const { toast } = useToast();
  const effectiveRules = useEffectiveTimeRules({ userId: timeTracking.user?.id });

  // Automatischer Start bei Zone-Betreten
  useEffect(() => {
    if (!autoStartEnabled || timeTracking.isTracking) return;

    if (currentDetection?.zone?.auto_start_tracking) {
      const handleAutoStart = async () => {
        console.log('Auto-starting time tracking for zone:', currentDetection.zone.name);
        
        // Hole automatische Projektzuordnung
        let suggestedProject = null;
        if (smartProjectAssignment) {
          suggestedProject = await aiTimeTracking.getAutomaticProjectSuggestion(
            currentDetection.zone.name
          );
        }

        // Starte Zeiterfassung mit vorgeschlagenem Projekt
        await timeTracking.handleTimeAction({
          location: currentDetection.zone.name,
          project: suggestedProject?.project_id || currentDetection.zone.default_project,
          note: `Automatisch gestartet bei Betreten der Zone "${currentDetection.zone.name}"`
        });

        toast({
          title: "Zeiterfassung automatisch gestartet",
          description: `Zone: ${currentDetection.zone.name}${suggestedProject ? ` • Projekt: ${suggestedProject.project_name}` : ''}`,
        });

        // Zeige Projektzuordnungs-Vorschlag falls verfügbar
        if (suggestedProject && suggestedProject.confidence > 80) {
          toast({
            title: "Smart Projektzuordnung",
            description: `${suggestedProject.reason} (${suggestedProject.confidence.toFixed(0)}% Sicherheit)`,
          });
        }
      };

      // Verzögerung um false positives zu vermeiden
      setTimeout(handleAutoStart, 2000);
    }
  }, [currentDetection, autoStartEnabled, timeTracking.isTracking, smartProjectAssignment, aiTimeTracking, timeTracking, toast]);

  // Automatischer Stopp bei Zone-Verlassen
  useEffect(() => {
    if (!timeTracking.isTracking || !timeTracking.currentActiveEntry) return;

    // Prüfe ob wir eine Zone verlassen haben, die Auto-Stop aktiviert hat
    const activeZone = zones.find(zone => 
      zone.name === timeTracking.currentActiveEntry?.location
    );

    if (activeZone?.auto_stop_tracking && !currentDetection) {
      const handleAutoStop = async () => {
        console.log('Auto-stopping time tracking for zone:', activeZone.name);
        
        await timeTracking.handleStop();
        
        toast({
          title: "Zeiterfassung automatisch beendet",
          description: `Zone "${activeZone.name}" verlassen`,
        });
      };

      // Verzögerung um kurze Unterbrechungen zu ignorieren
      setTimeout(handleAutoStop, 30000); // 30 Sekunden Puffer
    }
  }, [currentDetection, zones, timeTracking.isTracking, timeTracking.currentActiveEntry, timeTracking, toast]);

  // Analysiere Situation bei Änderungen
  useEffect(() => {
    if (currentDetection?.zone) {
      aiTimeTracking.analyzeCurrentSituation(
        currentDetection.zone.name,
        [] // Calendar events würden hier integriert
      );
    }
  }, [currentDetection, aiTimeTracking]);

  return {
    ...timeTracking,
    ...aiTimeTracking,
    currentDetection,
    autoStartEnabled,
    setAutoStartEnabled,
    smartProjectAssignment,
    setSmartProjectAssignment,
    effectiveRules,
    isSmartModeActive: autoStartEnabled || smartProjectAssignment
  };
};
