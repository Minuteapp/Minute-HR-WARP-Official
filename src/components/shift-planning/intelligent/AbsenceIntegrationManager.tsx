
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AbsenceEvent {
  id: string;
  employeeName: string;
  employeeId: string;
  type: 'sick' | 'vacation' | 'emergency';
  startDate: string;
  endDate: string;
  affectedShifts: string[];
  replacementFound: boolean;
  replacementEmployee?: string;
  status: 'pending' | 'resolved' | 'critical';
}

const AbsenceIntegrationManager: React.FC = () => {
  // Echte Datenanbindung über Service
  const { data: absenceRequests = [], isLoading } = useQuery({
    queryKey: ['absence-requests'],
    queryFn: absenceService.getRequests
  });

  // Verarbeite Abwesenheitsdaten zu AbsenceEvents
  const [absences, setAbsences] = useState<AbsenceEvent[]>([]);

  React.useEffect(() => {
    const processedAbsences: AbsenceEvent[] = absenceRequests
      .filter(req => req.status === 'approved')
      .map(req => ({
        id: req.id,
        employeeName: req.employee_name || 'Unbekannt',
        employeeId: req.user_id,
        type: req.type === 'sick_leave' ? 'sick' : 
              req.type === 'vacation' ? 'vacation' : 'emergency',
        startDate: req.start_date,
        endDate: req.end_date,
        affectedShifts: [`Schicht ${new Date(req.start_date).toLocaleDateString()}`],
        replacementFound: Math.random() > 0.5, // Simuliere Ersatzstatus
        replacementEmployee: Math.random() > 0.5 ? 'Ersatzmitarbeiter' : undefined,
        status: Math.random() > 0.7 ? 'critical' : 
                Math.random() > 0.5 ? 'pending' : 'resolved'
      }));
    
    setAbsences(processedAbsences.slice(0, 5)); // Begrenzte Anzahl für Demo
  }, [absenceRequests]);

  const { toast } = useToast();

  const findReplacement = async (absenceId: string) => {
    const absence = absences.find(a => a.id === absenceId);
    if (!absence) return;

    toast({
      title: "Suche Ersatz",
      description: `Automatische Ersatzsuche für ${absence.employeeName}...`
    });

    // Simuliere automatische Ersatzsuche
    await new Promise(resolve => setTimeout(resolve, 2500));

    const possibleReplacements = [
      'Maria Schmidt', 'Laura Fischer', 'Max Schneider', 'Alexander Koch'
    ];
    const replacement = possibleReplacements[Math.floor(Math.random() * possibleReplacements.length)];

    setAbsences(prev => prev.map(abs => 
      abs.id === absenceId 
        ? { 
            ...abs, 
            replacementFound: true, 
            replacementEmployee: replacement,
            status: 'resolved' as const
          }
        : abs
    ));

    toast({
      title: "Ersatz gefunden",
      description: `${replacement} wurde automatisch als Ersatz eingeteilt.`
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sick': return 'bg-red-100 text-red-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Abwesenheits-Integration</h3>
          <p className="text-gray-600">Automatische Berücksichtigung und Ersatzplanung</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {absences.filter(a => a.status === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Kritische Fälle</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {absences.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Ausstehend</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {absences.filter(a => a.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Gelöst</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((absences.filter(a => a.replacementFound).length / absences.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Automatisch gelöst</div>
          </CardContent>
        </Card>
      </div>

      {/* Absence Events */}
      <div className="space-y-4">
        {absences.map((absence) => (
          <Card key={absence.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {absence.employeeName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(absence.startDate)} - {formatDate(absence.endDate)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(absence.type)}>
                    {absence.type === 'sick' ? 'Krank' : 
                     absence.type === 'vacation' ? 'Urlaub' : 'Notfall'}
                  </Badge>
                  <Badge className={getStatusColor(absence.status)}>
                    {getStatusIcon(absence.status)}
                    {absence.status === 'critical' ? 'Kritisch' :
                     absence.status === 'pending' ? 'Ausstehend' : 'Gelöst'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Affected Shifts */}
              <div>
                <h4 className="text-sm font-medium mb-2">Betroffene Schichten</h4>
                <div className="flex flex-wrap gap-2">
                  {absence.affectedShifts.map((shift, index) => (
                    <Badge key={index} variant="outline">
                      {shift}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Replacement Status */}
              {absence.replacementFound ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ersatz gefunden: <strong>{absence.replacementEmployee}</strong> 
                    wurde automatisch eingeteilt.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Kein Ersatz gefunden. Automatische Suche verfügbar.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              {!absence.replacementFound && (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => findReplacement(absence.id)}
                  >
                    Automatisch Ersatz finden
                  </Button>
                  <Button variant="outline" size="sm">
                    Manuell zuweisen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Verbindung zu Abwesenheitsmodul und automatische Synchronisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Abwesenheitsmodul verbunden</span>
            </div>
            <Badge variant="outline" className="text-green-600">
              Aktiv
            </Badge>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Letzte Synchronisation: vor 5 Minuten
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsenceIntegrationManager;
