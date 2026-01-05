
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Clock, Eye, X, AlertCircle } from 'lucide-react';

const AbsenceOverview: React.FC = () => {
  // Echte Datenanbindung über Service
  const { data: absenceData = [], isLoading } = useQuery({
    queryKey: ['absence-requests'],
    queryFn: absenceService.getRequests
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abwesenheiten Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="pending">Ausstehend</TabsTrigger>
            <TabsTrigger value="approved">Genehmigt</TabsTrigger>
            <TabsTrigger value="rejected">Abgelehnt</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="text-muted-foreground">Lade Abwesenheitsdaten...</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : absenceData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">Keine Abwesenheitsdaten gefunden</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    absenceData.map((absence) => (
                      <TableRow key={absence.id}>
                        <TableCell className="font-medium">
                          {absence.employee_name || 'Unbekannter Mitarbeiter'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            absence.type === 'vacation' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            absence.type === 'sick_leave' || absence.type === 'sick' ? 'bg-red-100 text-red-800 border-red-200' :
                            absence.type === 'business_trip' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }>
                            {absence.type === 'vacation' ? 'Urlaub' :
                             absence.type === 'sick_leave' || absence.type === 'sick' ? 'Krankmeldung' :
                             absence.type === 'business_trip' ? 'Dienstreise' :
                             absence.type === 'parental' ? 'Elternzeit' :
                             'Sonstiges'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}
                          {absence.start_date !== absence.end_date && 
                            ` - ${format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            absence.status === 'approved' ? 'outline' :
                            absence.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {absence.status === 'approved' ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Genehmigt
                              </span>
                            ) : absence.status === 'pending' ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Ausstehend
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <X className="h-3 w-3" />
                                Abgelehnt
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="pending">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absenceData.filter(absence => absence.status === 'pending').map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="font-medium">
                        {absence.employee_name || 'Unbekannter Mitarbeiter'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          {absence.type === 'vacation' ? 'Urlaub' :
                           absence.type === 'sick_leave' || absence.type === 'sick' ? 'Krankmeldung' :
                           absence.type === 'business_trip' ? 'Dienstreise' :
                           absence.type === 'parental' ? 'Elternzeit' :
                           'Sonstiges'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}
                        {absence.start_date !== absence.end_date && 
                          ` - ${format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Ausstehend
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {absenceData.filter(absence => absence.status === 'pending').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">Keine ausstehenden Anträge</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="approved">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absenceData.filter(absence => absence.status === 'approved').map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="font-medium">
                        {absence.employee_name || 'Unbekannter Mitarbeiter'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {absence.type === 'vacation' ? 'Urlaub' :
                           absence.type === 'sick_leave' || absence.type === 'sick' ? 'Krankmeldung' :
                           absence.type === 'business_trip' ? 'Dienstreise' :
                           absence.type === 'parental' ? 'Elternzeit' :
                           'Sonstiges'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}
                        {absence.start_date !== absence.end_date && 
                          ` - ${format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Check className="h-3 w-3 mr-1" />
                          Genehmigt
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {absenceData.filter(absence => absence.status === 'approved').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">Keine genehmigten Anträge</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="rejected">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absenceData.filter(absence => absence.status === 'rejected').map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="font-medium">
                        {absence.employee_name || 'Unbekannter Mitarbeiter'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          {absence.type === 'vacation' ? 'Urlaub' :
                           absence.type === 'sick_leave' || absence.type === 'sick' ? 'Krankmeldung' :
                           absence.type === 'business_trip' ? 'Dienstreise' :
                           absence.type === 'parental' ? 'Elternzeit' :
                           'Sonstiges'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(absence.start_date), 'dd.MM.yyyy', { locale: de })}
                        {absence.start_date !== absence.end_date && 
                          ` - ${format(new Date(absence.end_date), 'dd.MM.yyyy', { locale: de })}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Abgelehnt
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {absenceData.filter(absence => absence.status === 'rejected').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">Keine abgelehnten Anträge</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AbsenceOverview;
