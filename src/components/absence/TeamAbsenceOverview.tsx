import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TeamAbsenceOverview = () => {
  const { data: teamStats = [] } = useQuery({
    queryKey: ['team-absence-stats'],
    queryFn: async () => {
      // Hole alle Mitarbeiter gruppiert nach Abteilung
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, name, department, team')
        .eq('status', 'active');

      if (empError) throw empError;

      // Hole aktuelle Abwesenheiten (nur genehmigte)
      const { data: absences, error: absError } = await supabase
        .from('absence_requests')
        .select('user_id, employee_name, department, start_date, end_date, type')
        .eq('status', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (absError) throw absError;

      // Gruppiere nach Abteilungen
      const departmentMap = new Map();
      
      employees?.forEach(emp => {
        const dept = emp.department || 'Unbekannt';
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, {
            name: dept,
            totalEmployees: 0,
            currentAbsences: 0,
            employees: []
          });
        }
        departmentMap.get(dept).totalEmployees++;
        departmentMap.get(dept).employees.push(emp);
      });

      // Zähle aktuelle Abwesenheiten
      const today = new Date();
      absences?.forEach(absence => {
        const startDate = new Date(absence.start_date);
        const endDate = new Date(absence.end_date);
        
        if (today >= startDate && today <= endDate) {
          const dept = absence.department || 'Unbekannt';
          if (departmentMap.has(dept)) {
            departmentMap.get(dept).currentAbsences++;
          }
        }
      });

      return Array.from(departmentMap.values()).map(dept => ({
        ...dept,
        absenceRate: dept.totalEmployees > 0 ? (dept.currentAbsences / dept.totalEmployees) * 100 : 0
      }));
    }
  });

  const { data: upcomingAbsences = [] } = useQuery({
    queryKey: ['upcoming-absences'],
    queryFn: async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('status', 'approved')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .lte('start_date', nextWeek.toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const getAbsenceRateColor = (rate: number) => {
    if (rate >= 20) return 'text-red-600 bg-red-100';
    if (rate >= 10) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getAbsenceRateStatus = (rate: number) => {
    if (rate >= 20) return 'Kritisch';
    if (rate >= 10) return 'Erhöht';
    return 'Normal';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team-Übersicht nach Abteilungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Abwesenheiten nach Abteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Keine Abteilungsdaten verfügbar
              </p>
            ) : (
              teamStats.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{dept.name}</h4>
                      <p className="text-sm text-gray-600">
                        {dept.currentAbsences} von {dept.totalEmployees} Mitarbeitern abwesend
                      </p>
                    </div>
                    <Badge className={getAbsenceRateColor(dept.absenceRate)}>
                      {dept.absenceRate.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={dept.absenceRate} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Abwesenheitsrate</span>
                    <span className={`font-medium ${
                      dept.absenceRate >= 20 ? 'text-red-600' :
                      dept.absenceRate >= 10 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {getAbsenceRateStatus(dept.absenceRate)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kommende Abwesenheiten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kommende Abwesenheiten (7 Tage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAbsences.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Keine kommenden Abwesenheiten
              </p>
            ) : (
              upcomingAbsences.map((absence) => (
                <div key={absence.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{absence.employee_name}</div>
                    <div className="text-sm text-gray-600">
                      {absence.department} • {new Date(absence.start_date).toLocaleDateString('de-DE')}
                      {absence.end_date !== absence.start_date && (
                        <> - {new Date(absence.end_date).toLocaleDateString('de-DE')}</>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`
                      ${absence.type === 'vacation' ? 'text-green-600' :
                        absence.type === 'sick' ? 'text-red-600' :
                        absence.type === 'training' ? 'text-blue-600' :
                        'text-gray-600'
                      }
                    `}>
                      {absence.type === 'vacation' ? 'Urlaub' :
                       absence.type === 'sick' ? 'Krank' :
                       absence.type === 'training' ? 'Fortbildung' :
                       absence.type === 'personal' ? 'Persönlich' :
                       absence.type === 'parental' ? 'Elternzeit' :
                       'Sabbatical'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warnungen und Alerts */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Warnungen & Empfehlungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamStats.some(dept => dept.absenceRate >= 20) && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Kritische Abwesenheitsrate</h4>
                  <p className="text-sm text-red-600">
                    Eine oder mehrere Abteilungen haben eine Abwesenheitsrate über 20%. 
                    Überprüfen Sie die Arbeitsbelastung und Personalplanung.
                  </p>
                </div>
              </div>
            )}

            {teamStats.some(dept => dept.absenceRate >= 10 && dept.absenceRate < 20) && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Erhöhte Abwesenheitsrate</h4>
                  <p className="text-sm text-orange-600">
                    Einige Abteilungen zeigen erhöhte Abwesenheitsraten. 
                    Monitoring und präventive Maßnahmen empfohlen.
                  </p>
                </div>
              </div>
            )}

            {upcomingAbsences.length >= 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Viele kommende Abwesenheiten</h4>
                  <p className="text-sm text-blue-600">
                    {upcomingAbsences.length} Mitarbeiter werden in der nächsten Woche abwesend sein. 
                    Stellen Sie sicher, dass alle wichtigen Aufgaben abgedeckt sind.
                  </p>
                </div>
              </div>
            )}

            {teamStats.every(dept => dept.absenceRate < 10) && upcomingAbsences.length < 5 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Users className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Alles im grünen Bereich</h4>
                  <p className="text-sm text-green-600">
                    Die Abwesenheitsraten sind normal und es stehen keine kritischen Ausfälle bevor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};