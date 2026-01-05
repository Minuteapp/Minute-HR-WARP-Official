
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  User,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ProjectAbsenceManagementProps {
  projectId: string;
  projectName: string;
}

export const ProjectAbsenceManagement: React.FC<ProjectAbsenceManagementProps> = ({
  projectId,
  projectName
}) => {
  const [selectedView, setSelectedView] = useState('current');

  // Echte Datenanbindung über Service
  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['project-absences', projectId],
    queryFn: () => absenceService.getRequests(),
    select: (data) => data.filter(req => 
      // Filtere Abwesenheiten für Projektmitarbeiter (vereinfacht)
      req.status === 'approved' || req.status === 'pending'
    )
  });

  const totalAbsences = absences.length;
  const pendingApprovals = absences.filter(a => a.status === 'pending').length;
  const approvedAbsences = absences.filter(a => a.status === 'approved').length;
  const totalDays = absences.reduce((sum, absence) => {
    const startDate = new Date(absence.start_date);
    const endDate = new Date(absence.end_date);
    return sum + Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'text-blue-600';
      case 'sick_leave':
      case 'sick':
        return 'text-red-600';
      case 'business_trip':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Abwesenheits-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Abwesenheiten</p>
                <p className="text-2xl font-bold">{totalAbsences}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausstehende Genehmigungen</p>
                <p className="text-2xl font-bold">{pendingApprovals}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Genehmigt</p>
                <p className="text-2xl font-bold">{approvedAbsences}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Tage</p>
                <p className="text-2xl font-bold">{totalDays}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abwesenheits-Kalendar */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Projekt-Abwesenheitskalender
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Abwesenheit planen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Kalender-Ansicht</h3>
            <p className="text-gray-600">
              Hier würde der interaktive Kalender mit allen Projekt-Abwesenheiten angezeigt werden.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Abwesenheits-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle und geplante Abwesenheiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Lade Abwesenheitsdaten...</div>
              </div>
            ) : absences.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Keine Abwesenheitsdaten gefunden</div>
              </div>
            ) : (
              absences.map((absence) => (
                <div key={absence.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{absence.employee_name || 'Unbekannter Mitarbeiter'}</h3>
                      <p className="text-sm text-gray-600">
                        <span className={getTypeColor(absence.type)}>
                          {absence.type === 'vacation' ? 'Urlaub' :
                           absence.type === 'sick_leave' || absence.type === 'sick' ? 'Krankmeldung' :
                           absence.type === 'business_trip' ? 'Dienstreise' :
                           absence.type === 'parental' ? 'Elternzeit' :
                           'Sonstiges'}
                        </span>
                        {' • '}
                        {new Date(absence.start_date).toLocaleDateString()} - {new Date(absence.end_date).toLocaleDateString()}
                        {' • '}
                        {Math.ceil((new Date(absence.end_date).getTime() - new Date(absence.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} Tag{Math.ceil((new Date(absence.end_date).getTime() - new Date(absence.start_date).getTime()) / (1000 * 60 * 60 * 24)) > 0 ? 'e' : ''}
                      </p>
                      <p className="text-xs text-gray-500">{absence.reason || 'Kein Grund angegeben'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(absence.status)}
                    {absence.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team-Verfügbarkeit */}
      <Card>
        <CardHeader>
          <CardTitle>Team-Verfügbarkeit Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-green-600">Verfügbar</h4>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-500">Mitarbeiter</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-yellow-600">Teilweise verfügbar</h4>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-500">Mitarbeiter</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-red-600">Nicht verfügbar</h4>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-500">Mitarbeiter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projekt-Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Auswirkungen auf das Projekt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Kritische Phase betroffen</p>
                  <p className="text-sm text-gray-600">Michael Weber ist in der Implementierungsphase abwesend</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Maßnahmen planen
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Kein kritischer Impact</p>
                  <p className="text-sm text-gray-600">Alle anderen Abwesenheiten sind gut eingeplant</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
