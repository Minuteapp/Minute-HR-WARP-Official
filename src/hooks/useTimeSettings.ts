import { useState, useEffect } from 'react';
import { TimePolicy, EntityReference } from '@/types/time-settings';
import { TimeSettingsService } from '@/services/timeSettingsService';
import { toast } from '@/hooks/use-toast';

export const useTimeSettings = () => {
  const [policies, setPolicies] = useState<TimePolicy[]>([]);
  const [entities, setEntities] = useState<EntityReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lade alle Daten beim ersten Aufruf
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [policiesData, entitiesData] = await Promise.all([
        TimeSettingsService.loadAllPolicies(),
        TimeSettingsService.loadOrganizationalEntities()
      ]);

      setPolicies(policiesData);
      setEntities(entitiesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      console.error('Fehler beim Laden der Zeiteinstellungen:', err);
      
      toast({
        title: "Fehler beim Laden",
        description: "Die Arbeitszeit-Einstellungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Richtlinie einer Organisationseinheit zuweisen
  const assignPolicyToEntity = async (policy: TimePolicy, entity: EntityReference) => {
    try {
      await TimeSettingsService.assignPolicyToEntity(policy, entity);
      
      toast({
        title: "Richtlinie zugewiesen",
        description: `${policy.title} wurde erfolgreich zu ${entity.name} zugewiesen.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      console.error('Fehler beim Zuweisen der Richtlinie:', err);
      
      toast({
        title: "Fehler beim Zuweisen",
        description: `Die Richtlinie konnte nicht zugewiesen werden: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Daten neu laden
  const refetch = () => {
    loadData();
  };

  return {
    policies,
    entities,
    loading,
    error,
    assignPolicyToEntity,
    refetch
  };
};