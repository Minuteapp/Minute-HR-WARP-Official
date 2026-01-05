import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Settings2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragAndDropContainer } from '@/components/time-settings/DragAndDropContainer';
import { PolicyCard } from '@/components/time-settings/PolicyCard';
import { EntityDropZone } from '@/components/time-settings/EntityDropZone';
import { TimePolicy, EntityReference } from '@/types/time-settings';
import { useTimeSettings } from '@/hooks/useTimeSettings';

export default function TimeSettingsDragDrop() {
  const navigate = useNavigate();
  const { policies, entities, loading, error, assignPolicyToEntity } = useTimeSettings();

  const handlePolicyDrop = (policy: TimePolicy, entity: EntityReference) => {
    console.log('Policy dropped:', policy.title, 'on', entity.name);
    assignPolicyToEntity(policy, entity);
  };

  if (loading) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings/worktime-absence")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arbeitszeit & Abwesenheiten</h1>
            <p className="text-muted-foreground mt-2">
              Drag & Drop Konfiguration von Richtlinien und Zuweisungen
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Lade Arbeitszeit-Richtlinien...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings/worktime-absence")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arbeitszeit & Abwesenheiten</h1>
            <p className="text-muted-foreground mt-2">
              Drag & Drop Konfiguration von Richtlinien und Zuweisungen
            </p>
          </div>
        </div>
        
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Fehler beim Laden</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Seite neu laden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/settings/worktime-absence")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arbeitszeit & Abwesenheiten</h1>
          <p className="text-muted-foreground mt-2">
            Drag & Drop Konfiguration von Richtlinien und Zuweisungen ({policies.length} Richtlinien, {entities.length} Organisationseinheiten)
          </p>
        </div>
      </div>

      <DragAndDropContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Policy Library */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Verfügbare Richtlinien ({policies.length})
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Richtlinie
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {policies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Richtlinien gefunden</p>
                    <p className="text-sm">Erstellen Sie neue Richtlinien über den Button oben.</p>
                  </div>
                ) : (
                  policies.map((policy) => (
                    <PolicyCard 
                      key={policy.id} 
                      policy={policy}
                      isDraggable={true}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Entity Assignment Zones */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organisationseinheiten ({entities.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {entities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Organisationseinheiten gefunden</p>
                    <p className="text-sm">Erstellen Sie Unternehmen, Abteilungen oder Teams.</p>
                  </div>
                ) : (
                  entities.map((entity) => (
                    <EntityDropZone
                      key={entity.id}
                      entity={entity}
                      onPolicyDrop={handlePolicyDrop}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DragAndDropContainer>
    </div>
  );
}