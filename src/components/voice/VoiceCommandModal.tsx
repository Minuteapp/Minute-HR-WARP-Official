import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useHybridSpeechRecognition } from '@/hooks/today/useHybridSpeechRecognition';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import VoiceActionConfirmation from './VoiceActionConfirmation';
import { useTasksStore } from '@/stores/tasks/useTasksStore';
import { absenceService } from '@/services/absenceService';
import { goalService } from '@/services/goalService';
import { calendarService } from '@/services/calendarService';
import { documentService } from '@/services/documentService';
import { innovationService } from '@/services/innovationService';

interface VoiceCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIResponse {
  summary: string;
  explanation?: string;
  suggested_actions?: Array<{
    action: string;
    label: string;
    parameters: Record<string, any>;
    requires_confirmation: boolean;
  }>;
  data_sources?: string[];
  confidence?: 'high' | 'medium' | 'low';
  limitations?: string[];
  links_to_ui?: Array<{
    label: string;
    path: string;
  }>;
  // Legacy fields
  action?: string;
  parameters?: Record<string, any>;
  response?: string;
}

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ open, onOpenChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { 
    isListening, 
    toggleListening, 
    transcript, 
    error,
    currentMethod,
    resetTranscript,
    audioLevel,
    remainingTime
  } = useHybridSpeechRecognition();

  const autoStartedRef = useRef(false);

  // Auto-Start Aufnahme wenn Modal öffnet
  useEffect(() => {
    if (open && !isListening && !isProcessing && !autoStartedRef.current && !pendingConfirmation) {
      autoStartedRef.current = true;
      const timer = setTimeout(() => {
        toggleListening();
      }, 300);
      return () => clearTimeout(timer);
    }
    
    if (!open) {
      autoStartedRef.current = false;
    }
  }, [open, isListening, isProcessing, toggleListening, pendingConfirmation]);

  // Verarbeite Spracheingabe wenn verfügbar
  useEffect(() => {
    if (transcript && !isProcessing && !pendingConfirmation) {
      handleVoiceCommand(transcript);
      resetTranscript();
    }
  }, [transcript, isProcessing, pendingConfirmation]);

  const handleVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    setAiResponse(null);
    
    try {
      console.log('🎤 Sende Sprachbefehl:', text);
      
      const { data, error } = await supabase.functions.invoke('voice-command', {
        body: { 
          text,
          context: {
            currentPath: window.location.pathname,
            userId: user?.id
          }
        }
      });

      if (error) {
        throw error;
      }

      const response = data as AIResponse;
      console.log('🤖 Erhaltene Antwort:', response);

      setAiResponse(response);

      // Prüfe ob Bestätigung erforderlich
      const mainAction = response.suggested_actions?.[0];
      const needsConfirmation = mainAction?.requires_confirmation ?? false;

      if (needsConfirmation) {
        // Warte auf User-Bestätigung
        setPendingConfirmation(true);
        
        // Text-to-Speech für die Zusammenfassung
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.summary);
          utterance.lang = 'de-DE';
          utterance.rate = 0.9;
          speechSynthesis.speak(utterance);
        }
      } else {
        // Direkte Ausführung (Navigation, Suche, Status)
        if (mainAction) {
          await executeAction(mainAction.action, mainAction.parameters);
        }
        
        // Text-to-Speech
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.summary);
          utterance.lang = 'de-DE';
          utterance.rate = 0.9;
          speechSynthesis.speak(utterance);
        }
      }

    } catch (error) {
      console.error('❌ Fehler bei Sprachbefehl:', error);
      const errorMsg = 'Entschuldigung, es gab einen Fehler bei der Verarbeitung.';
      setAiResponse({
        summary: errorMsg,
        confidence: 'low'
      });
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async (action: string, parameters: Record<string, any>) => {
    setIsExecuting(true);
    try {
      await executeAction(action, parameters);
      toast.success('Aktion erfolgreich ausgeführt');
    } catch (err) {
      console.error('❌ Fehler bei Aktion:', err);
      toast.error('Aktion konnte nicht ausgeführt werden');
    } finally {
      setIsExecuting(false);
      setPendingConfirmation(false);
    }
  };

  const handleCancel = () => {
    setPendingConfirmation(false);
    setAiResponse(null);
    
    // Stoppe Text-to-Speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const executeAction = async (action: string, parameters: Record<string, any>) => {
    switch (action) {
      case 'navigate':
        if (parameters.path) {
          navigate(parameters.path);
          setTimeout(() => onOpenChange(false), 1500);
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
          console.log('✅ Zeiterfassung per Sprache gestartet');
          showSuccess();
        } else {
          toast.error('Bitte erst anmelden');
        }
        break;
        
      case 'stop_time_tracking':
      case 'stop_time':
        if (user?.id) {
          const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
          if (activeEntry) {
            await timeTrackingService.endTimeTracking(activeEntry.id);
            await invalidateTimeQueries();
            console.log('✅ Zeiterfassung per Sprache gestoppt');
            showSuccess();
          } else {
            toast.error('Keine aktive Zeiterfassung gefunden');
          }
        } else {
          toast.error('Bitte erst anmelden');
        }
        break;

      case 'pause_time':
        if (user?.id) {
          // Pause-Funktion: Wir stoppen die aktive Zeiterfassung temporär
          const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
          if (activeEntry) {
            await timeTrackingService.endTimeTracking(activeEntry.id);
            await invalidateTimeQueries();
            toast.info('Pause gestartet - Zeiterfassung pausiert');
            console.log('✅ Pause per Sprache gestartet');
            showSuccess();
          } else {
            toast.error('Keine aktive Zeiterfassung gefunden');
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
          showSuccess();
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
          showSuccess();
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
            showSuccess();
          }
        }
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
          showSuccess();
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
            showSuccess();
          }
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
          showSuccess();
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
          showSuccess();
        }
        break;
        
      case 'search':
        if (parameters.query) {
          console.log('🔍 Suche nach:', parameters.query);
          navigate(`/search?q=${encodeURIComponent(parameters.query)}`);
        }
        break;

      case 'status':
        // Nur Info, keine Aktion
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
          showSuccess();
        }
        break;

      case 'get_today_events':
        console.log('📅 Heutige Termine abgefragt');
        break;

      // AUSGABEN - navigiere zur Ausgaben-Seite
      case 'create_expense':
        navigate('/expenses/new');
        console.log('📝 Navigiere zu Ausgaben-Formular');
        showSuccess();
        break;

      // TEAMS - navigiere zur Team-Seite
      case 'create_team':
        navigate('/teams/new');
        console.log('👥 Navigiere zu Team-Formular');
        showSuccess();
        break;

      // DOKUMENTE
      case 'search_documents':
        if (parameters.query) {
          const docs = await documentService.searchDocuments(parameters.query);
          console.log('📄 Gefundene Dokumente:', docs.length);
          navigate(`/documents?search=${encodeURIComponent(parameters.query)}`);
          showSuccess();
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
          showSuccess();
        }
        break;

      // MITARBEITER SUCHEN
      case 'find_employee':
        if (parameters.name) {
          navigate(`/employees?search=${encodeURIComponent(parameters.name)}`);
          console.log('🔍 Suche Mitarbeiter:', parameters.name);
          showSuccess();
        }
        break;

      // BUDGET STATUS
      case 'get_budget_status':
        console.log('💰 Budget-Status abgefragt');
        navigate('/budget');
        showSuccess();
        break;
        
      default:
        console.log('🤷‍♂️ Unbekannte Aktion:', action);
    }
  };

  const invalidateTimeQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
    await queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    await queryClient.invalidateQueries({ queryKey: ['todayStats'] });
  };

  const showSuccess = () => {
    setActionSuccess(true);
    setTimeout(() => {
      setActionSuccess(false);
      onOpenChange(false);
    }, 2000);
  };

  const handleClose = () => {
    if (isListening) {
      toggleListening();
    }
    resetTranscript();
    setAiResponse(null);
    setActionSuccess(false);
    setPendingConfirmation(false);
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            ALEX - Sprach-Assistent
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Erfolgsanimation */}
          {actionSuccess && (
            <div className="flex items-center gap-2 text-green-600 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Befehl ausgeführt!</span>
            </div>
          )}

          {/* Bestätigungs-Flow */}
          {pendingConfirmation && aiResponse && (
            <VoiceActionConfirmation
              response={aiResponse}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isExecuting={isExecuting}
            />
          )}

          {/* Normale Ansicht (nicht im Bestätigungs-Modus) */}
          {!pendingConfirmation && (
            <>
              {/* Audio Level Indikator */}
              {isListening && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-1.5 bg-red-500 rounded-full transition-all duration-100"
                        style={{ 
                          height: `${Math.max(8, audioLevel * 40 * (1 + Math.random() * 0.5))}px`,
                          opacity: audioLevel > i * 0.2 ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ⏱️ {remainingTime}s
                  </span>
                </div>
              )}

              {/* Mikrofon Button */}
              <div className="relative">
                <Button
                  onClick={toggleListening}
                  disabled={isProcessing}
                  size="lg"
                  className={`w-24 h-24 rounded-full transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  style={{
                    transform: isListening ? `scale(${1 + audioLevel * 0.15})` : 'scale(1)'
                  }}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8 text-white" />
                  ) : (
                    <Mic className="h-8 w-8 text-white" />
                  )}
                </Button>
                
                {/* Pulsierender Ring bei Aufnahme */}
                {isListening && (
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"
                    style={{ opacity: 0.3 }}
                  />
                )}
              </div>
              
              {/* Status Text */}
              <div className="text-center space-y-2">
                {error ? (
                  <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                    <p className="text-sm text-orange-800 font-medium">
                      {currentMethod === 'whisper' ? '🔄 Whisper API aktiv' : 'Hinweis:'}
                    </p>
                    <p className="text-sm text-orange-700">{error}</p>
                  </div>
                ) : isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-primary">Verarbeite...</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Ihr Befehl wird analysiert</p>
                  </div>
                ) : isListening ? (
                  <div>
                    <p className="text-sm font-medium text-red-600 animate-pulse">🔴 Aufnahme läuft</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sprechen Sie jetzt – stoppt automatisch bei Stille
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="text-lg font-mono font-bold text-primary">{remainingTime}s</span>
                      <span className="text-xs text-muted-foreground">verbleibend</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">🎤 Aufnahme startet automatisch...</p>
                )}
                
                {transcript && (
                  <div className="mt-3 p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">Erkannt:</p>
                    <p className="text-sm text-muted-foreground">"{transcript}"</p>
                  </div>
                )}
              </div>
              
              {/* AI Antwort (ohne Bestätigung) */}
              {aiResponse && !pendingConfirmation && (
                <div className="w-full p-3 bg-primary/5 rounded-md border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Antwort:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{aiResponse.summary}</p>
                </div>
              )}
              
              {/* Beispiele */}
              <div className="w-full text-xs text-muted-foreground">
                <p className="font-medium mb-1">Beispiele:</p>
                <ul className="space-y-1">
                  <li>• "Starte Zeiterfassung"</li>
                  <li>• "Stoppe die Arbeit"</li>
                  <li>• "Gehe zum Kalender"</li>
                  <li>• "Erstelle Aufgabe Meeting vorbereiten"</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCommandModal;