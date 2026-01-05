import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Users, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays, isWeekend, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

interface ConflictCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestData: {
    start_date: string;
    end_date: string;
    user_id: string;
    employee_name: string;
    department?: string;
    team?: string;
  };
}

interface ConflictResult {
  hasConflicts: boolean;
  severity: 'low' | 'medium' | 'high';
  conflictDays: {
    date: string;
    conflictingMembers: string[];
    teamCoverage: number;
  }[];
  recommendations: string[];
  approvalRisk: 'none' | 'low' | 'medium' | 'high';
}

export const ConflictCheckDialog = ({ open, onOpenChange, requestData }: ConflictCheckDialogProps) => {
  const [conflictAnalysis, setConflictAnalysis] = useState<ConflictResult | null>(null);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members-conflict', requestData.department, requestData.team],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('id, name, department, team')
        .eq('status', 'active');

      if (requestData.department) {
        query = query.eq('department', requestData.department);
      }

      if (requestData.team) {
        query = query.eq('team', requestData.team);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!(requestData.department || requestData.team)
  });

  const { data: existingAbsences = [] } = useQuery({
    queryKey: ['existing-absences-conflict', requestData.start_date, requestData.end_date],
    queryFn: async () => {
      // Hole alle genehmigten Abwesenheiten, die sich mit dem Zeitraum überschneiden
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('status', 'approved')
        .or(`start_date.lte.${requestData.end_date},end_date.gte.${requestData.start_date}`)
        .neq('user_id', requestData.user_id); // Exclude own requests

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!requestData.start_date && !!requestData.end_date
  });

  useEffect(() => {
    if (open && teamMembers.length > 0 && requestData.start_date && requestData.end_date) {
      analyzeConflicts();
    }
  }, [open, teamMembers, existingAbsences, requestData]);

  const analyzeConflicts = () => {
    if (!teamMembers.length) return;

    const startDate = parseISO(requestData.start_date);
    const endDate = parseISO(requestData.end_date);
    const requestDays = differenceInDays(endDate, startDate) + 1;

    const conflictDays: { date: string; conflictingMembers: string[]; teamCoverage: number; }[] = [];
    const recommendations: string[] = [];

    // Analysiere jeden Tag der geplanten Abwesenheit
    for (let i = 0; i < requestDays; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(currentDay.getDate() + i);
      const dayStr = format(currentDay, 'yyyy-MM-dd');

      // Finde überschneidende Abwesenheiten für diesen Tag
      const conflictingAbsences = existingAbsences.filter(absence => {
        const absenceStart = parseISO(absence.start_date);
        const absenceEnd = parseISO(absence.end_date);
        return isWithinInterval(currentDay, { start: absenceStart, end: absenceEnd });
      });

      if (conflictingAbsences.length > 0) {
        const conflictingMembers = conflictingAbsences.map(a => a.employee_name);
        const totalAbsent = conflictingMembers.length + 1; // +1 für die neue Anfrage
        const teamCoverage = ((teamMembers.length - totalAbsent) / teamMembers.length) * 100;

        conflictDays.push({
          date: dayStr,
          conflictingMembers,
          teamCoverage
        });
      }
    }

    // Bestimme Schweregrad
    let severity: 'low' | 'medium' | 'high' = 'low';
    let approvalRisk: 'none' | 'low' | 'medium' | 'high' = 'none';

    const minCoverage = Math.min(...conflictDays.map(d => d.teamCoverage), 100);
    const weekendDays = conflictDays.filter(d => isWeekend(parseISO(d.date))).length;

    if (minCoverage < 50) {
      severity = 'high';
      approvalRisk = 'high';
      recommendations.push('❌ Kritisch: Weniger als 50% Teambesetzung an mindestens einem Tag.');
      recommendations.push('🔄 Empfehlung: Antrag verschieben oder externe Unterstützung organisieren.');
    } else if (minCoverage < 70) {
      severity = 'medium';
      approvalRisk = 'medium';
      recommendations.push('⚠️ Achtung: Reduzierte Teambesetzung (unter 70%).');
      recommendations.push('📋 Empfehlung: Aufgabenverteilung anpassen und Bereitschaftsdienst planen.');
    } else if (conflictDays.length > 0) {
      severity = 'low';
      approvalRisk = 'low';
      recommendations.push('ℹ️ Info: Moderate Überschneidungen vorhanden.');
      recommendations.push('✅ Empfehlung: Kann genehmigt werden mit entsprechender Planung.');
    }

    // Zusätzliche Empfehlungen
    if (weekendDays > 0) {
      recommendations.push(`📅 ${weekendDays} Wochenendtage betroffen - reduzierte Auswirkungen.`);
    }

    if (requestDays > 10) {
      recommendations.push('📆 Lange Abwesenheit: Detaillierte Übergabe-Dokumentation erforderlich.');
    }

    if (conflictDays.length === 0) {
      recommendations.push('✅ Keine Konflikte erkannt - kann problemlos genehmigt werden.');
      approvalRisk = 'none';
    }

    setConflictAnalysis({
      hasConflicts: conflictDays.length > 0,
      severity,
      conflictDays,
      recommendations,
      approvalRisk
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'low': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getApprovalRecommendation = (risk: string) => {
    switch (risk) {
      case 'high': return { text: 'Ablehnung empfohlen', color: 'text-red-600' };
      case 'medium': return { text: 'Bedingte Genehmigung', color: 'text-orange-600' };
      case 'low': return { text: 'Genehmigung möglich', color: 'text-yellow-600' };
      case 'none': return { text: 'Empfohlene Genehmigung', color: 'text-green-600' };
      default: return { text: 'Unbekannt', color: 'text-gray-600' };
    }
  };

  if (!conflictAnalysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Konfliktprüfung läuft...</DialogTitle>
            <DialogDescription>
              Analysiere Team-Verfügbarkeit und mögliche Konflikte.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const approvalRec = getApprovalRecommendation(conflictAnalysis.approvalRisk);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getSeverityIcon(conflictAnalysis.severity)}
            Konfliktanalyse - {requestData.employee_name}
          </DialogTitle>
          <DialogDescription>
            Zeitraum: {format(parseISO(requestData.start_date), 'dd.MM.yyyy', { locale: de })} - {format(parseISO(requestData.end_date), 'dd.MM.yyyy', { locale: de })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Zusammenfassung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Zusammenfassung</span>
                <Badge className={getSeverityColor(conflictAnalysis.severity)}>
                  {conflictAnalysis.severity === 'high' ? 'Kritisch' :
                   conflictAnalysis.severity === 'medium' ? 'Achtung' :
                   conflictAnalysis.severity === 'low' ? 'Info' : 'OK'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Teamgröße</p>
                    <p className="text-sm text-muted-foreground">{teamMembers.length} Mitglieder</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Konflikttage</p>
                    <p className="text-sm text-muted-foreground">{conflictAnalysis.conflictDays.length} von {differenceInDays(parseISO(requestData.end_date), parseISO(requestData.start_date)) + 1}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className={`font-medium ${approvalRec.color}`}>Empfehlung</p>
                    <p className={`text-sm ${approvalRec.color}`}>{approvalRec.text}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailanalyse */}
          {conflictAnalysis.conflictDays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Konfliktdetails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conflictAnalysis.conflictDays.map((day, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {format(parseISO(day.date), 'dd.MM.yyyy (EEEE)', { locale: de })}
                        </span>
                        <Badge variant={day.teamCoverage < 50 ? 'destructive' : day.teamCoverage < 70 ? 'secondary' : 'default'}>
                          {day.teamCoverage.toFixed(0)}% Besetzung
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ebenfalls abwesend: {day.conflictingMembers.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empfehlungen */}
          <Card>
            <CardHeader>
              <CardTitle>Empfehlungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conflictAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aktionen */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
            <Button 
              variant={conflictAnalysis.approvalRisk === 'high' ? 'destructive' : 'default'}
              onClick={() => {
                // Hier könnte die automatische Genehmigung/Ablehnung implementiert werden
                onOpenChange(false);
              }}
            >
              {conflictAnalysis.approvalRisk === 'high' ? 'Ablehnen' : 
               conflictAnalysis.approvalRisk === 'none' ? 'Genehmigen' : 'Entscheidung treffen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};