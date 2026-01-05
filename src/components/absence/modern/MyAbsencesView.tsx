import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { useAuth } from '@/contexts/AuthContext';
import { AbsenceRequestDialog } from './AbsenceRequestDialog';
import { EditAbsenceDialog } from './EditAbsenceDialog';
import { DeleteAbsenceDialog } from './DeleteAbsenceDialog';
import { absenceManagementService } from '@/services/absenceManagementService';

export const MyAbsencesView: React.FC = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null);

  const handleEdit = (absence: any) => {
    setSelectedAbsence(absence);
    setEditDialogOpen(true);
  };

  const handleDelete = (absence: any) => {
    setSelectedAbsence(absence);
    setDeleteDialogOpen(true);
  };
  
  const { data: myAbsences = [] } = useQuery({
    queryKey: ['my-absences', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const allRequests = await absenceService.getRequests();
      console.log('Alle Abwesenheitsanträge:', allRequests.length);
      console.log('Aktueller Benutzer ID:', user.id);
      const filtered = allRequests.filter((absence: any) => absence.user_id === user.id);
      console.log('Gefilterte Anträge für Benutzer:', filtered.length, filtered);
      return filtered;
    },
    enabled: !!user?.id
  });

  // Echte Statistiken aus DB laden
  const { data: vacationStats } = useQuery({
    queryKey: ['vacation-stats', user?.id],
    queryFn: () => absenceManagementService.getVacationStatsForEmployee(user!.id),
    enabled: !!user?.id
  });

  const stats = [
    {
      title: 'Urlaubsanspruch',
      value: vacationStats?.entitlement?.toString() || '30',
      suffix: ' Tage',
      subtitle: 'Gesamt pro Jahr',
      icon: Calendar,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Verbraucht',
      value: vacationStats?.used?.toString() || '0',
      suffix: ' Tage',
      subtitle: `${Math.round((vacationStats?.used || 0) / (vacationStats?.entitlement || 30) * 100)}% verwendet`,
      icon: Calendar,
      color: 'text-red-600',
      iconBg: 'bg-red-50'
    },
    {
      title: 'Resturlaub',
      value: vacationStats?.remaining?.toString() || '30',
      suffix: ' Tage',
      subtitle: 'Noch verfügbar',
      icon: Calendar,
      color: 'text-green-600',
      iconBg: 'bg-green-50'
    },
    {
      title: 'Geplant',
      value: vacationStats?.planned?.toString() || '0',
      suffix: ' Tage',
      subtitle: 'Zukünftige Abwesenheiten',
      icon: Calendar,
      color: 'text-orange-600',
      iconBg: 'bg-orange-50'
    }
  ];

  // Aktive/Kommende Abwesenheiten:
  // - Alle pending Anträge (egal welches Datum)
  // - Genehmigte/Abgelehnte mit end_date >= heute
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAbsences = myAbsences
    .filter((a: any) => {
      const endDate = new Date(a.end_date);
      endDate.setHours(0, 0, 0, 0);
      
      // Pending-Anträge immer anzeigen
      if (a.status === 'pending') return true;
      
      // Genehmigte/Abgelehnte nur wenn noch nicht vorbei
      return endDate >= today;
    })
    .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 4);

  const displayedAbsences = myAbsences.slice(0, 4);

  const getTypeBadgeColors = (type: string) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      sick_leave: 'bg-red-100 text-red-700 hover:bg-red-100',
      business_trip: 'bg-green-100 text-green-700 hover:bg-green-100',
      other: 'bg-orange-100 text-orange-700 hover:bg-orange-100'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadgeColors = (status: string) => {
    const colors = {
      approved: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
      pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
      rejected: 'bg-red-100 text-red-700 hover:bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      vacation: 'Urlaub',
      sick_leave: 'Krankheit',
      business_trip: 'Homeoffice',
      other: 'Sonderurlaub'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      approved: 'Genehmigt',
      pending: 'Ausstehend',
      rejected: 'Abgelehnt'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const calculateDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? '1 Tag' : `${days} Tage`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meine Abwesenheiten</h2>
          <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Urlaube und Abwesenheiten</p>
        </div>
        <Button size="lg" onClick={() => setIsDialogOpen(true)}>
          + Neuer Antrag
        </Button>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-0.5">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <span className="text-lg text-muted-foreground">{stat.suffix}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kommende Abwesenheiten */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Kommende Abwesenheiten</h3>
        <div className="space-y-3">
          {upcomingAbsences.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Keine kommenden Abwesenheiten
              </CardContent>
            </Card>
          ) : (
            upcomingAbsences.map((absence: any) => (
              <Card key={absence.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeBadgeColors(absence.type)}>
                          {getTypeLabel(absence.type)}
                        </Badge>
                        <Badge className={getStatusBadgeColors(absence.status)}>
                          {getStatusLabel(absence.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{calculateDuration(absence.start_date, absence.end_date)}</span>
                        </div>
                        {absence.substitute_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Vertretung: {absence.substitute_name}</span>
                          </div>
                        )}
                        {absence.created_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Beantragt am {format(new Date(absence.created_at), 'dd.MM.yyyy', { locale: de })}</span>
                          </div>
                        )}
                        {absence.reason && (
                          <p className="text-muted-foreground italic mt-2">"{absence.reason}"</p>
                        )}
                        {/* Hinweis für ausstehende Anträge */}
                        {absence.status === 'pending' && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-xs text-amber-700 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Wartet auf Genehmigung durch Vorgesetzten
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(absence)}
                        disabled={absence.status === 'approved'}
                        title={absence.status === 'approved' ? 'Genehmigte Anträge können nicht bearbeitet werden' : 'Bearbeiten'}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(absence)}
                        disabled={absence.status === 'approved'}
                        title={absence.status === 'approved' ? 'Genehmigte Anträge können nicht gelöscht werden' : 'Löschen'}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Alle Abwesenheiten */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Alle Abwesenheiten</h3>
        <div className="space-y-3">
          {displayedAbsences.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Keine Abwesenheiten vorhanden
              </CardContent>
            </Card>
          ) : (
            displayedAbsences.map((absence: any) => (
              <Card key={absence.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header: Badges und Datum */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeBadgeColors(absence.type)}>
                          {getTypeLabel(absence.type)}
                        </Badge>
                        <Badge className={getStatusBadgeColors(absence.status)}>
                          {getStatusLabel(absence.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Datum */}
                    <div className="font-semibold text-base">
                      {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}
                    </div>
                    
                    {/* Details in zwei Spalten */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Linke Spalte */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{calculateDuration(absence.start_date, absence.end_date)}</span>
                        </div>
                        {absence.substitute_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>Vertretung: {absence.substitute_name || 'Thomas Weber'}</span>
                          </div>
                        )}
                        {!absence.substitute_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>Vertretung: -</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Rechte Spalte */}
                      <div className="space-y-1">
                        {absence.status === 'approved' && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">Genehmigt von: {absence.approved_by || 'Maria Schmidt'}</span>
                          </div>
                        )}
                        {absence.created_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">Beantragt: {format(new Date(absence.created_at), 'dd.MM.yyyy', { locale: de })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Grund */}
                    {absence.reason && (
                      <p className="text-sm text-muted-foreground italic">"{absence.reason}"</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog für neuen Antrag */}
      <AbsenceRequestDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />

      {/* Edit Dialog */}
      <EditAbsenceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        absence={selectedAbsence}
      />

      {/* Delete Confirmation */}
      <DeleteAbsenceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        absenceId={selectedAbsence?.id || null}
        absenceType={selectedAbsence?.type}
        startDate={selectedAbsence?.start_date ? format(new Date(selectedAbsence.start_date), 'dd.MM.yyyy', { locale: de }) : undefined}
        endDate={selectedAbsence?.end_date ? format(new Date(selectedAbsence.end_date), 'dd.MM.yyyy', { locale: de }) : undefined}
      />
    </div>
  );
};
