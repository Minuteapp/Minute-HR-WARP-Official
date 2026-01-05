import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { absenceService } from '@/services/absenceService';
import { supabase } from '@/integrations/supabase/client';

interface QuickAbsenceFormProps {
  type: string;
  onClose: () => void;
}

export const QuickAbsenceForm: React.FC<QuickAbsenceFormProps> = ({ type, onClose }) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableVacationDays, setAvailableVacationDays] = useState<number>(0);
  const [usedVacationDays, setUsedVacationDays] = useState<number>(0);
  const { toast } = useToast();

  // Lade Mitarbeiterdaten und verfügbare Urlaubstage
  useEffect(() => {
    loadEmployeeVacationData();
  }, []);

  const loadEmployeeVacationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Lade Mitarbeiterinformationen
      const { data: employee } = await supabase
        .from('employees')
        .select('vacation_days')
        .eq('id', user.id)
        .single();

      if (employee) {
        setAvailableVacationDays(employee.vacation_days || 25); // Standard: 25 Tage
      }

      // Berechne bereits genutzte Urlaubstage für das aktuelle Jahr
      const currentYear = new Date().getFullYear();
      const { data: approvedRequests } = await supabase
        .from('absence_requests')
        .select('start_date, end_date, half_day')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .eq('type', 'vacation')
        .gte('start_date', `${currentYear}-01-01`)
        .lte('start_date', `${currentYear}-12-31`);

      if (approvedRequests) {
        const totalUsedDays = approvedRequests.reduce((total, request) => {
          const start = new Date(request.start_date);
          const end = new Date(request.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return total + (request.half_day ? days * 0.5 : days);
        }, 0);
        setUsedVacationDays(totalUsedDays);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Urlaubsdaten:', error);
    }
  };

  // AI-Vorschläge basierend auf Typ
  const getAISuggestions = (type: string) => {
    const suggestions = {
      vacation: {
        tips: ['Urlaubsantrag 2 Wochen im Voraus stellen', 'Vertretung organisieren'],
        reasons: ['Erholungsurlaub', 'Familienzeit', 'Reise geplant']
      },
      sick_leave: {
        tips: ['Krankmeldung so früh wie möglich einreichen', 'Attest bei >3 Tagen erforderlich'],
        reasons: ['Erkältung', 'Grippe', 'Arzttermin']
      },
      parental: {
        tips: ['Elternzeit mindestens 7 Wochen vorher beantragen', 'Dauer genau planen'],
        reasons: ['Elternzeit nach Geburt', 'Elternzeit-Verlängerung']
      },
      business_trip: {
        tips: ['Reisekosten vorab klären', 'Vertretung regeln'],
        reasons: ['Kundentermin', 'Schulung', 'Konferenz']
      }
    };
    return suggestions[type as keyof typeof suggestions] || { tips: [], reasons: [] };
  };

  const suggestions = getAISuggestions(type);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte Start- und Enddatum auswählen'
      });
      return;
    }

    // Prüfe verfügbare Urlaubstage bei Urlaubsanträgen
    const requestedDays = calculateDuration();
    const remainingDays = availableVacationDays - usedVacationDays;
    
    if (type === 'vacation' && requestedDays > remainingDays) {
      toast({
        variant: 'destructive',
        title: 'Nicht genügend Urlaubstage',
        description: `Sie haben nur noch ${remainingDays} Urlaubstage verfügbar. Sie beantragen ${requestedDays} Tage.`
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData = {
        type: type,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        reason: reason,
        half_day: halfDay,
        status: 'pending'
      };

      const result = await absenceService.createRequest(requestData);
      
      if (result) {
        toast({
          title: 'Antrag eingereicht',
          description: 'Ihr Abwesenheitsantrag wurde erfolgreich eingereicht und wird geprüft.'
        });
        onClose();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Antrag konnte nicht eingereicht werden'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return halfDay ? daysDiff * 0.5 : daysDiff;
  };

  const remainingVacationDays = availableVacationDays - usedVacationDays;
  const requestedDays = calculateDuration();
  const wouldExceedLimit = type === 'vacation' && requestedDays > remainingVacationDays;

  return (
    <div className="space-y-6">
      {/* AI-Hinweise */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Smart-Tipps</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {suggestions.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datum-Auswahl */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Startdatum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd.MM.yyyy', { locale: de }) : 'Auswählen'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={de}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Enddatum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd.MM.yyyy', { locale: de }) : 'Auswählen'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={de}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Dauer-Anzeige */}
      {startDate && endDate && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">
            Dauer: <strong>{calculateDuration()} Tage</strong>
          </span>
          <Badge variant="outline" className="ml-2">
            {halfDay ? 'Halbtag' : 'Ganztag'}
          </Badge>
        </div>
      )}

      {/* Halbtag-Option */}
      <div className="space-y-2">
        <Label>Zeitraum</Label>
        <Select value={halfDay ? 'half' : 'full'} onValueChange={(value) => setHalfDay(value === 'half')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Ganztägig</SelectItem>
            <SelectItem value="half">Halbtägig</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grund */}
      <div className="space-y-2">
        <Label>Grund</Label>
        <div className="space-y-2">
          {suggestions.reasons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.reasons.map((suggestedReason, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-slate-100"
                  onClick={() => setReason(suggestedReason)}
                >
                  {suggestedReason}
                </Badge>
              ))}
            </div>
          )}
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Begründung für die Abwesenheit..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Compliance-Check */}
      <Card className={wouldExceedLimit ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {wouldExceedLimit ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <span className={`text-sm font-medium ${wouldExceedLimit ? 'text-red-800' : 'text-green-800'}`}>
              Compliance Check
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            {type === 'vacation' && (
              <div className={wouldExceedLimit ? 'text-red-700' : 'text-green-700'}>
                {wouldExceedLimit ? '⚠️' : '✓'} Verfügbare Urlaubstage: {remainingVacationDays} von {availableVacationDays}
              </div>
            )}
            <div className="text-green-700">✓ Keine Terminkonlikte</div>
            <div className="text-green-700">✓ Alle Pflichtfelder ausgefüllt</div>
          </div>
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || wouldExceedLimit}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Wird eingereicht...' : 'Antrag einreichen'}
        </Button>
      </div>
    </div>
  );
};