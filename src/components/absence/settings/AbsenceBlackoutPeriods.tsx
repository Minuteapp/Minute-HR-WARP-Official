import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trash2, Plus, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface BlackoutPeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  absence_type?: string;
  department?: string;
  is_active: boolean;
}

export const AbsenceBlackoutPeriods = () => {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<BlackoutPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    absence_type: '',
    department: '',
    is_active: true
  });

  useEffect(() => {
    loadBlackoutPeriods();
  }, []);

  const loadBlackoutPeriods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('absence_blackout_periods')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPeriods(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Sperrperioden:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sperrperioden konnten nicht geladen werden."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = async () => {
    if (!newPeriod.start_date || !newPeriod.end_date || !newPeriod.reason) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('absence_blackout_periods')
        .insert({
          start_date: newPeriod.start_date,
          end_date: newPeriod.end_date,
          reason: newPeriod.reason,
          absence_type: newPeriod.absence_type || null,
          department: newPeriod.department || null,
          is_active: newPeriod.is_active
        });

      if (error) throw error;

      toast({
        title: "Sperrperiode hinzugefügt",
        description: "Die Sperrperiode wurde erfolgreich erstellt."
      });

      setNewPeriod({
        start_date: '',
        end_date: '',
        reason: '',
        absence_type: '',
        department: '',
        is_active: true
      });

      loadBlackoutPeriods();
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sperrperiode konnte nicht erstellt werden."
      });
    }
  };

  const handleDeletePeriod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('absence_blackout_periods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sperrperiode gelöscht",
        description: "Die Sperrperiode wurde erfolgreich entfernt."
      });

      loadBlackoutPeriods();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sperrperiode konnte nicht gelöscht werden."
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('absence_blackout_periods')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status geändert",
        description: `Sperrperiode wurde ${!isActive ? 'aktiviert' : 'deaktiviert'}.`
      });

      loadBlackoutPeriods();
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht geändert werden."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Neue Sperrperiode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neue Sperrperiode erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Startdatum *</Label>
              <Input
                id="start-date"
                type="date"
                value={newPeriod.start_date}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Enddatum *</Label>
              <Input
                id="end-date"
                type="date"
                value={newPeriod.end_date}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Grund *</Label>
            <Input
              id="reason"
              placeholder="z.B. Inventur, Jahresabschluss"
              value={newPeriod.reason}
              onChange={(e) => setNewPeriod(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="absence-type">Abwesenheitstyp (optional)</Label>
              <Select
                value={newPeriod.absence_type || "all"}
                onValueChange={(value) => setNewPeriod(prev => ({ ...prev, absence_type: value === "all" ? "" : value }))}
              >
                <SelectTrigger id="absence-type">
                  <SelectValue placeholder="Alle Typen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="sick">Krankheit</SelectItem>
                  <SelectItem value="training">Weiterbildung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Abteilung (optional)</Label>
              <Input
                id="department"
                placeholder="z.B. Vertrieb, IT"
                value={newPeriod.department}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="is-active"
                checked={newPeriod.is_active}
                onCheckedChange={(checked) => setNewPeriod(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is-active">Sofort aktivieren</Label>
            </div>

            <Button onClick={handleAddPeriod} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Sperrperiode erstellen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste der Sperrperioden */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Bestehende Sperrperioden
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Lädt Sperrperioden...</div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Sperrperioden vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(period.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(period.end_date), 'dd.MM.yyyy', { locale: de })}
                      </span>
                      {!period.is_active && (
                        <span className="text-xs px-2 py-1 bg-muted rounded">Inaktiv</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{period.reason}</p>
                    {(period.absence_type || period.department) && (
                      <div className="flex gap-2 mt-2">
                        {period.absence_type && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {period.absence_type}
                          </span>
                        )}
                        {period.department && (
                          <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded">
                            {period.department}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={period.is_active}
                      onCheckedChange={() => handleToggleActive(period.id, period.is_active)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeletePeriod(period.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
