import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Holiday {
  id?: string;
  name: string;
  holiday_date: string;
  location_code: string;
  is_public_holiday: boolean;
}

export const AbsenceHolidayManagement = () => {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    holiday_date: '',
    location_code: 'DE',
    is_public_holiday: true
  });

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const { data, error } = await supabase
        .from('absence_holidays')
        .select('*')
        .order('holiday_date', { ascending: true });

      if (error) throw error;
      setHolidays(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Feiertage:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Feiertage konnten nicht geladen werden."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.holiday_date) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('absence_holidays')
        .insert({
          name: newHoliday.name,
          holiday_date: newHoliday.holiday_date,
          location_code: newHoliday.location_code || 'DE',
          is_public_holiday: newHoliday.is_public_holiday ?? true,
          company_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) throw error;

      toast({
        title: "Feiertag hinzugefügt",
        description: `${newHoliday.name} wurde erfolgreich hinzugefügt.`
      });

      setNewHoliday({
        name: '',
        holiday_date: '',
        location_code: 'DE',
        is_public_holiday: true
      });
      loadHolidays();
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Feiertag konnte nicht hinzugefügt werden."
      });
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Feiertag wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('absence_holidays')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Feiertag gelöscht",
        description: "Der Feiertag wurde erfolgreich entfernt."
      });
      loadHolidays();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Feiertag konnte nicht gelöscht werden."
      });
    }
  };

  const loadGermanHolidays2025 = () => {
    const germanHolidays = [
      { name: 'Neujahr', date: '2025-01-01' },
      { name: 'Karfreitag', date: '2025-04-18' },
      { name: 'Ostermontag', date: '2025-04-21' },
      { name: 'Tag der Arbeit', date: '2025-05-01' },
      { name: 'Christi Himmelfahrt', date: '2025-05-29' },
      { name: 'Pfingstmontag', date: '2025-06-09' },
      { name: 'Tag der Deutschen Einheit', date: '2025-10-03' },
      { name: '1. Weihnachtstag', date: '2025-12-25' },
      { name: '2. Weihnachtstag', date: '2025-12-26' },
    ];

    germanHolidays.forEach(holiday => {
      setNewHoliday({
        name: holiday.name,
        holiday_date: holiday.date,
        location_code: 'DE',
        is_public_holiday: true
      });
      setTimeout(() => handleAddHoliday(), 100);
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Lädt Feiertage...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Feiertage verwalten
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadGermanHolidays2025}
          >
            Deutsche Feiertage 2025 laden
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Neuer Feiertag */}
        <div className="p-4 border rounded-lg space-y-3">
          <h3 className="text-sm font-semibold">Neuen Feiertag hinzufügen</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label className="text-xs">Bezeichnung</Label>
              <Input
                value={newHoliday.name || ''}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Neujahr"
              />
            </div>
            <div>
              <Label className="text-xs">Datum</Label>
              <Input
                type="date"
                value={newHoliday.holiday_date || ''}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, holiday_date: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleAddHoliday} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Feiertag hinzufügen
          </Button>
        </div>

        {/* Feiertage Liste */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Gespeicherte Feiertage ({holidays.length})</h3>
          {holidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Noch keine Feiertage eingetragen
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {holidays.map(holiday => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{holiday.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(holiday.holiday_date), 'dd.MM.yyyy', { locale: de })} • {holiday.location_code}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => holiday.id && handleDeleteHoliday(holiday.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Hinweis:</strong> Feiertage werden bei der Berechnung von Abwesenheitstagen automatisch berücksichtigt 
            und nicht vom Urlaubskontingent abgezogen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
