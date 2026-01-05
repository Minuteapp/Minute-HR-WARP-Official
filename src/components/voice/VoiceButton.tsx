import React, { useEffect, useRef } from 'react';
import { Mic, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHybridSpeechRecognition } from '@/hooks/today/useHybridSpeechRecognition';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTasksStore } from '@/stores/tasks/useTasksStore';
import { absenceService } from '@/services/absenceService';
import { goalService } from '@/services/goalService';
import { calendarService } from '@/services/calendarService';
import { documentService } from '@/services/documentService';
import { innovationService } from '@/services/innovationService';

type VoiceState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

const VoiceButton: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [voiceState, setVoiceState] = React.useState<VoiceState>('idle');
  const processingRef = useRef(false);

  const {
    isListening,
    toggleListening,
    transcript,
    error,
    resetTranscript,
    audioLevel
  } = useHybridSpeechRecognition();

  // Sync listening state
  useEffect(() => {
    if (isListening && voiceState === 'idle') {
      setVoiceState('recording');
    } else if (!isListening && voiceState === 'recording' && !processingRef.current) {
      // Recording stopped, waiting for transcript
    }
  }, [isListening, voiceState]);

  // Process transcript when available
  useEffect(() => {
    if (transcript && !processingRef.current) {
      processingRef.current = true;
      setVoiceState('processing');
      handleVoiceCommand(transcript);
      resetTranscript();
    }
  }, [transcript]);

  // Handle errors
  useEffect(() => {
    if (error && voiceState === 'recording') {
      setVoiceState('error');
      toast.error(error);
      setTimeout(() => setVoiceState('idle'), 2000);
    }
  }, [error, voiceState]);

  const handleClick = () => {
    console.log('🎤 VoiceButton geklickt, aktueller State:', voiceState);
    
    if (voiceState === 'processing') {
      console.log('🎤 Verarbeitung läuft, ignoriere Klick');
      return;
    }
    
    if (voiceState === 'idle') {
      console.log('🎤 Starte Aufnahme...');
      toast.info('🎤 Aufnahme gestartet - Sprechen Sie jetzt');
      setVoiceState('recording');
      toggleListening();
    } else if (voiceState === 'recording') {
      console.log('🎤 Stoppe Aufnahme...');
      toast.info('⏹️ Aufnahme beendet - Verarbeite...');
      toggleListening();
    }
  };

  const handleVoiceCommand = async (text: string) => {
    try {
      console.log('🎤 Verarbeite Sprachbefehl:', text);

      const { data, error: fnError } = await supabase.functions.invoke('voice-command', {
        body: {
          text,
          context: {
            currentPath: window.location.pathname,
            userId: user?.id
          }
        }
      });

      if (fnError) throw fnError;

      const response = data;
      console.log('🤖 Antwort:', response);

      const mainAction = response.suggested_actions?.[0];
      let actionExecuted = false;
      let actionErrorMessage: string | null = null;

      if (mainAction) {
        const autoExecutable =
          !mainAction.requires_confirmation ||
          ['start_time_tracking', 'stop_time_tracking', 'pause_time', 'resume_time', 'start_time', 'stop_time'].includes(
            mainAction.action
          );

        if (autoExecutable) {
          try {
            await executeAction(mainAction.action, mainAction.parameters);
            actionExecuted = true;

            // Falls keine Summary geliefert wurde, wenigstens ein Erfolgs-Toast anzeigen
            if (!response.summary) {
              toast.success(`✅ ${mainAction.label || 'Aktion ausgeführt'}`);
            }
          } catch (actionError: any) {
            actionErrorMessage = actionError?.message || 'Unbekannter Fehler';
            console.error('❌ Fehler bei Aktion:', actionError);
            toast.error(`Aktion fehlgeschlagen: ${actionErrorMessage}`);
          }
        } else {
          toast.info('Aktion benötigt Bestätigung und wurde nicht automatisch ausgeführt.');
        }
      } else {
        toast.info('Kein ausführbarer Befehl erkannt.');
      }

      // Sprachausgabe: niemals "Erfolg" vorlesen, wenn die Aktion nicht ausgeführt wurde
      const ttsText = actionErrorMessage
        ? `Aktion fehlgeschlagen: ${actionErrorMessage}`
        : mainAction && !actionExecuted
          ? 'Aktion wurde nicht ausgeführt.'
          : response.summary;

      if ('speechSynthesis' in window && ttsText) {
        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.lang = 'de-DE';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }

      // Summary als Toast anzeigen – aber nicht als "success", wenn nichts ausgeführt wurde
      if (response.summary) {
        if (actionErrorMessage || (mainAction && !actionExecuted)) {
          toast.info(response.summary);
        } else {
          toast.success(response.summary);
        }
      }

      const nextState: VoiceState = actionErrorMessage ? 'error' : 'success';
      setVoiceState(nextState);

      setTimeout(() => {
        setVoiceState('idle');
        processingRef.current = false;
      }, actionErrorMessage ? 2000 : 1500);

    } catch (err: any) {
      console.error('❌ Fehler:', err);
      toast.error(`Verarbeitungsfehler: ${err.message || 'Unbekannter Fehler'}`);
      setVoiceState('error');
      setTimeout(() => {
        setVoiceState('idle');
        processingRef.current = false;
      }, 2000);
    }
  };

  const executeAction = async (action: string, parameters: Record<string, any>) => {
    switch (action) {
      case 'navigate':
        if (parameters.path) {
          navigate(parameters.path);
        }
        break;

      case 'start_time_tracking':
      case 'start_time':
        if (user?.id) {
          await timeTrackingService.startTimeTracking({
            project: parameters.project || 'general',
            location: parameters.location || 'office',
            note: parameters.note || 'Gestartet per Sprachbefehl',
            user_id: user.id,
            start_time: new Date().toISOString()
          });
          await invalidateTimeQueries();
        }
        break;

      case 'stop_time_tracking':
      case 'stop_time':
        if (user?.id) {
          const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
          if (activeEntry) {
            await timeTrackingService.endTimeTracking(activeEntry.id);
            await invalidateTimeQueries();
          }
        }
        break;

      case 'search':
        if (parameters.query) {
          navigate(`/search?q=${encodeURIComponent(parameters.query)}`);
        }
        break;

      case 'create_task':
        if (parameters.title) {
          const { addTask } = useTasksStore.getState();
          const success = await addTask({
            title: parameters.title,
            description: parameters.description || '',
            status: 'todo',
            priority: parameters.priority || 'medium',
            dueDate: parameters.due_date,
            assignedTo: user?.id ? [user.id] : [],
            tags: [],
            progress: 0
          });
          if (success) {
            await queryClient.invalidateQueries({ queryKey: ['tasks'] });
            console.log('✅ Aufgabe per Sprache erstellt:', parameters.title);
          }
        }
        break;

      case 'request_vacation':
        if (parameters.start_date && parameters.end_date && user?.id) {
          const result = await absenceService.createRequest({
            type: 'vacation',
            start_date: parameters.start_date,
            end_date: parameters.end_date,
            reason: parameters.reason || 'Per Sprachbefehl beantragt',
            user_id: user.id,
            half_day: false
          });
          if (result) {
            await queryClient.invalidateQueries({ queryKey: ['absences'] });
            console.log('✅ Urlaubsantrag per Sprache erstellt');
          }
        }
        break;

      case 'log_time':
        if (parameters.hours && user?.id) {
          const hours = parseFloat(parameters.hours);
          const now = new Date();
          const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
          
          await timeTrackingService.startTimeTracking({
            project: parameters.project || 'general',
            location: 'office',
            note: parameters.description || 'Manuelle Buchung per Sprachbefehl',
            user_id: user.id,
            start_time: startTime.toISOString()
          });
          
          const entry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
          if (entry) {
            await timeTrackingService.endTimeTracking(entry.id);
          }
          await invalidateTimeQueries();
          console.log('✅ Zeit manuell gebucht:', hours, 'Stunden');
        }
        break;

      case 'pause_time':
        if (user?.id) {
          // Pause-Funktion: Wir stoppen die aktive Zeiterfassung temporär
          // (Pause wird als separate kurze Zeiteinträge behandelt)
          const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
          if (activeEntry) {
            await timeTrackingService.endTimeTracking(activeEntry.id);
            await invalidateTimeQueries();
            toast.info('Pause gestartet - Zeiterfassung pausiert');
            console.log('✅ Pause per Sprache gestartet');
          }
        }
        break;

      case 'resume_time':
        if (user?.id) {
          // Resume-Funktion: Starte eine neue Zeiterfassung
          await timeTrackingService.startTimeTracking({
            project: 'general',
            location: 'office',
            note: 'Fortgesetzt nach Pause per Sprachbefehl',
            user_id: user.id,
            start_time: new Date().toISOString()
          });
          await invalidateTimeQueries();
          toast.info('Weiter gearbeitet - Zeiterfassung fortgesetzt');
          console.log('✅ Pause per Sprache beendet');
        }
        break;

      case 'status':
        // Status wird nur als Sprachausgabe/Toast angezeigt, keine Aktion nötig
        console.log('📊 Status-Abfrage:', parameters);
        break;

      case 'create_goal':
        if (parameters.title && user?.id) {
          const today = new Date().toISOString().split('T')[0];
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + 3); // 3 Monate als Standard
          
          await goalService.createGoal({
            title: parameters.title,
            description: parameters.description || '',
            category: parameters.category || 'personal',
            status: 'active',
            priority: parameters.priority || 'medium',
            progress: 0,
            created_by: user.id,
            assigned_to: user.id,
            start_date: today,
            due_date: parameters.due_date || dueDate.toISOString().split('T')[0]
          });
          await queryClient.invalidateQueries({ queryKey: ['goals'] });
          console.log('✅ Ziel per Sprache erstellt:', parameters.title);
        }
        break;

      case 'request_sick_leave':
        if (user?.id) {
          const today = new Date().toISOString().split('T')[0];
          await absenceService.createRequest({
            type: 'sick',
            start_date: parameters.start_date || today,
            end_date: parameters.end_date || today,
            reason: parameters.reason || 'Krankmeldung per Sprachbefehl',
            user_id: user.id,
            half_day: false
          });
          await queryClient.invalidateQueries({ queryKey: ['absences'] });
          console.log('✅ Krankmeldung per Sprache erstellt');
        }
        break;

      case 'request_home_office':
        if (user?.id) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateStr = parameters.date || tomorrow.toISOString().split('T')[0];
          
          await absenceService.createRequest({
            type: 'remote',
            start_date: dateStr,
            end_date: dateStr,
            reason: parameters.reason || 'Home-Office per Sprachbefehl',
            user_id: user.id,
            half_day: false
          });
          await queryClient.invalidateQueries({ queryKey: ['absences'] });
        console.log('✅ Home-Office per Sprache beantragt');
        }
        break;

      // KALENDER
      case 'create_event':
        if (parameters.title && user?.id) {
          const start = new Date();
          if (parameters.start_date) {
            const [y, m, d] = parameters.start_date.split('-');
            start.setFullYear(parseInt(y), parseInt(m) - 1, parseInt(d));
          }
          if (parameters.start_time) {
            const [h, min] = parameters.start_time.split(':');
            start.setHours(parseInt(h), parseInt(min) || 0);
          }
          const end = new Date(start.getTime() + (parameters.duration_minutes || 60) * 60000);
          
          await calendarService.createEvent({
            title: parameters.title,
            start: start.toISOString(),
            end: end.toISOString(),
            type: parameters.type || 'meeting'
          });
          await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
          console.log('✅ Termin per Sprache erstellt:', parameters.title);
        }
        break;

      case 'get_today_events':
        // Status-Abfrage - Info im Summary
        console.log('📅 Heutige Termine abgefragt');
        break;

      // AUSGABEN - navigiere zur Ausgaben-Seite
      case 'create_expense':
        navigate('/expenses/new');
        console.log('📝 Navigiere zu Ausgaben-Formular');
        break;

      // TEAMS - navigiere zur Team-Seite
      case 'create_team':
        navigate('/teams/new');
        console.log('👥 Navigiere zu Team-Formular');
        break;

      // DOKUMENTE
      case 'search_documents':
        if (parameters.query) {
          const docs = await documentService.searchDocuments(parameters.query);
          console.log('📄 Gefundene Dokumente:', docs.length);
          navigate(`/documents?search=${encodeURIComponent(parameters.query)}`);
        }
        break;

      // INNOVATION
      case 'create_idea':
        if (parameters.title) {
          await innovationService.createIdea({
            title: parameters.title,
            description: parameters.description || 'Per Sprachbefehl eingereicht',
            category: 'improvement',
            tags: [],
            priority: 'medium',
            expected_impact: 'medium',
            implementation_effort: 'medium'
          });
          await queryClient.invalidateQueries({ queryKey: ['innovation-ideas'] });
          console.log('✅ Idee per Sprache eingereicht:', parameters.title);
        }
        break;

      // MITARBEITER SUCHEN
      case 'find_employee':
        if (parameters.name) {
          navigate(`/employees?search=${encodeURIComponent(parameters.name)}`);
          console.log('🔍 Suche Mitarbeiter:', parameters.name);
        }
        break;

      // BUDGET STATUS
      case 'get_budget_status':
        console.log('💰 Budget-Status abgefragt');
        navigate('/budget');
        break;

      default:
        console.log('Aktion:', action, parameters);
    }
  };

  const invalidateTimeQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', user?.id] });
    await queryClient.refetchQueries({ queryKey: ['activeTimeEntry', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
    await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
    await queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    await queryClient.invalidateQueries({ queryKey: ['todayStats'] });
  };

  const getButtonStyles = () => {
    switch (voiceState) {
      case 'recording':
        return 'bg-red-500 hover:bg-red-600 animate-pulse';
      case 'processing':
        return 'bg-primary/70 cursor-wait';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-destructive hover:bg-destructive/90';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const getIcon = () => {
    switch (voiceState) {
      case 'processing':
        return <Loader2 className="h-4 w-4 text-white animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-white" />;
      default:
        return <Mic className="h-4 w-4 text-white" />;
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        variant="outline"
        disabled={voiceState === 'processing'}
        className={cn(
          'relative transition-all duration-200 text-white border-0',
          getButtonStyles()
        )}
        style={{
          transform: voiceState === 'recording' ? `scale(${1 + audioLevel * 0.1})` : 'scale(1)'
        }}
      >
        {getIcon()}
      </Button>

      {/* Pulsing ring during recording */}
      {voiceState === 'recording' && (
        <div className="absolute inset-0 rounded-md border-2 border-red-400 animate-ping pointer-events-none" />
      )}
    </div>
  );
};

export default VoiceButton;
