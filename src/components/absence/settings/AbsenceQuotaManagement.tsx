import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Edit, Save, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AbsenceQuota {
  id: string;
  user_id: string;
  absence_type: string;
  total_days: number;
  used_days: number;
  planned_days: number;
  remaining_days: number;
  carryover_days: number;
  quota_year: number;
}

export const AbsenceQuotaManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [quotas, setQuotas] = useState<AbsenceQuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AbsenceQuota>>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadQuotas();
  }, [selectedYear, user?.id]);

  const loadQuotas = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('absence_quotas')
        .select('*')
        .eq('quota_year', selectedYear)
        .order('absence_type');

      if (error) throw error;

      const quotasWithCalculations = (data || []).map(q => ({
        ...q,
        remaining_days: q.total_days - q.used_days - q.planned_days + (q.carryover_days || 0)
      }));

      setQuotas(quotasWithCalculations);
    } catch (error) {
      console.error('Fehler beim Laden der Kontingente:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kontingente konnten nicht geladen werden."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (quota: AbsenceQuota) => {
    setEditingId(quota.id);
    setEditValues({
      total_days: quota.total_days,
      carryover_days: quota.carryover_days
    });
  };

  const handleSaveEdit = async (quotaId: string) => {
    try {
      const { error } = await supabase
        .from('absence_quotas')
        .update({
          total_days: editValues.total_days,
          carryover_days: editValues.carryover_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', quotaId);

      if (error) throw error;

      toast({
        title: "Kontingent aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert."
      });

      setEditingId(null);
      setEditValues({});
      loadQuotas();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Änderungen konnten nicht gespeichert werden."
      });
    }
  };

  const getAbsenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick: 'Krankheit',
      training: 'Weiterbildung',
      special: 'Sonderurlaub',
      parental: 'Elternzeit'
    };
    return labels[type] || type;
  };

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Jahr-Auswahl */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Kontingent-Übersicht
            </div>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Lädt Kontingente...</div>
          ) : quotas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Kontingente für {selectedYear} vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {quotas.map((quota) => {
                const isEditing = editingId === quota.id;
                const progressPercentage = ((quota.used_days + quota.planned_days) / quota.total_days) * 100;

                return (
                  <div
                    key={quota.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{getAbsenceTypeLabel(quota.absence_type)}</h4>
                        <p className="text-sm text-muted-foreground">
                          Jahr: {quota.quota_year}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => isEditing ? handleSaveEdit(quota.id) : handleStartEdit(quota)}
                      >
                        {isEditing ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Speichern
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </>
                        )}
                      </Button>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Gesamt-Tage</Label>
                          <Input
                            type="number"
                            value={editValues.total_days ?? quota.total_days}
                            onChange={(e) => setEditValues(prev => ({ 
                              ...prev, 
                              total_days: parseFloat(e.target.value) 
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Übertrag vom Vorjahr</Label>
                          <Input
                            type="number"
                            value={editValues.carryover_days ?? quota.carryover_days}
                            onChange={(e) => setEditValues(prev => ({ 
                              ...prev, 
                              carryover_days: parseFloat(e.target.value) 
                            }))}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Fortschrittsbalken */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Verbraucht & Geplant</span>
                            <span>{quota.used_days + quota.planned_days} / {quota.total_days} Tage</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(quota.remaining_days, quota.total_days)}`}
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Statistiken */}
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="p-2 bg-muted rounded">
                            <div className="text-muted-foreground text-xs">Verfügbar</div>
                            <div className="font-medium">{quota.total_days}</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded">
                            <div className="text-muted-foreground text-xs">Verbraucht</div>
                            <div className="font-medium text-red-600">{quota.used_days}</div>
                          </div>
                          <div className="p-2 bg-orange-50 rounded">
                            <div className="text-muted-foreground text-xs">Geplant</div>
                            <div className="font-medium text-orange-600">{quota.planned_days}</div>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-muted-foreground text-xs">Verbleibend</div>
                            <div className="font-medium text-green-600">{quota.remaining_days.toFixed(1)}</div>
                          </div>
                        </div>

                        {quota.carryover_days > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Davon Übertrag: {quota.carryover_days} Tage
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info-Box */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <Users className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">Hinweis zur Kontingent-Verwaltung</p>
              <p>
                Hier können Sie die Urlaubskontingente für alle Mitarbeiter verwalten. 
                Die verbrauchten und geplanten Tage werden automatisch bei Genehmigung von Abwesenheitsanträgen aktualisiert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
