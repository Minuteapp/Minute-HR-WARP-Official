import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useTasksStore } from '@/stores/tasks/useTasksStore';
import { absenceService } from '@/services/absenceService';
import { goalService } from '@/services/goalService';
import { calendarService } from '@/services/calendarService';
import { documentService } from '@/services/documentService';
import { innovationService } from '@/services/innovationService';
import { toast } from 'sonner';

export const useMinuteCompanionActions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidateTimeQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
    await queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    await queryClient.invalidateQueries({ queryKey: ['todayStats'] });
  };

  const executeAction = async (action: string, parameters: Record<string, any> = {}) => {
    console.log('🎯 Minute Companion führt Aktion aus:', action, parameters);

    try {
      switch (action) {
        // NAVIGATION
        case 'navigate':
          if (parameters.path) {
            navigate(parameters.path);
          }
          break;

        case 'search':
          if (parameters.query) {
            navigate(`/search?q=${encodeURIComponent(parameters.query)}`);
          }
          break;

        // ZEITERFASSUNG
        case 'start_time_tracking':
        case 'start_time':
          if (user?.id) {
            await timeTrackingService.startTimeTracking({
              project: parameters.project || 'general',
              location: parameters.location || 'office',
              note: parameters.note || 'Gestartet per Minute Companion',
              user_id: user.id,
              start_time: new Date().toISOString()
            });
            await invalidateTimeQueries();
            toast.success('Zeiterfassung gestartet!');
            console.log('✅ Zeiterfassung per Chat gestartet');
          }
          break;

        case 'stop_time_tracking':
        case 'stop_time':
          if (user?.id) {
            const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
            if (activeEntry) {
              await timeTrackingService.endTimeTracking(activeEntry.id);
              await invalidateTimeQueries();
              toast.success('Zeiterfassung gestoppt!');
              console.log('✅ Zeiterfassung per Chat gestoppt');
            } else {
              toast.info('Keine aktive Zeiterfassung gefunden');
            }
          }
          break;

        case 'pause_time':
          if (user?.id) {
            const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
            if (activeEntry) {
              await timeTrackingService.endTimeTracking(activeEntry.id);
              await invalidateTimeQueries();
              toast.success('Pause gestartet!');
              console.log('✅ Pause per Chat gestartet');
            }
          }
          break;

        case 'resume_time':
          if (user?.id) {
            await timeTrackingService.startTimeTracking({
              project: 'general',
              location: 'office',
              note: 'Fortgesetzt nach Pause per Minute Companion',
              user_id: user.id,
              start_time: new Date().toISOString()
            });
            await invalidateTimeQueries();
            toast.success('Weiter gearbeitet!');
            console.log('✅ Pause per Chat beendet');
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
              note: parameters.description || 'Manuelle Buchung per Minute Companion',
              user_id: user.id,
              start_time: startTime.toISOString()
            });
            
            const entry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
            if (entry) {
              await timeTrackingService.endTimeTracking(entry.id);
            }
            await invalidateTimeQueries();
            toast.success(`${hours} Stunden gebucht!`);
            console.log('✅ Zeit manuell gebucht:', hours, 'Stunden');
          }
          break;

        // AUFGABEN
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
              toast.success('Aufgabe erstellt!');
              console.log('✅ Aufgabe per Chat erstellt:', parameters.title);
            }
          }
          break;

        // ZIELE
        case 'create_goal':
          if (parameters.title && user?.id) {
            const today = new Date().toISOString().split('T')[0];
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 3);
            
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
            toast.success('Ziel erstellt!');
            console.log('✅ Ziel per Chat erstellt:', parameters.title);
          }
          break;

        // ABWESENHEIT
        case 'request_vacation':
          if (parameters.start_date && parameters.end_date && user?.id) {
            const result = await absenceService.createRequest({
              type: 'vacation',
              start_date: parameters.start_date,
              end_date: parameters.end_date,
              reason: parameters.reason || 'Per Minute Companion beantragt',
              user_id: user.id,
              half_day: false
            });
            if (result) {
              await queryClient.invalidateQueries({ queryKey: ['absences'] });
              toast.success('Urlaubsantrag eingereicht!');
              console.log('✅ Urlaubsantrag per Chat erstellt');
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
              reason: parameters.reason || 'Krankmeldung per Minute Companion',
              user_id: user.id,
              half_day: false
            });
            await queryClient.invalidateQueries({ queryKey: ['absences'] });
            toast.success('Krankmeldung eingereicht!');
            console.log('✅ Krankmeldung per Chat erstellt');
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
              reason: parameters.reason || 'Home-Office per Minute Companion',
              user_id: user.id,
              half_day: false
            });
            await queryClient.invalidateQueries({ queryKey: ['absences'] });
            toast.success('Home-Office beantragt!');
            console.log('✅ Home-Office per Chat beantragt');
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
            toast.success('Termin erstellt!');
            console.log('✅ Termin per Chat erstellt:', parameters.title);
          }
          break;

        case 'get_today_events':
          console.log('📅 Heutige Termine abgefragt');
          navigate('/calendar');
          break;

        // AUSGABEN
        case 'create_expense':
          navigate('/expenses/new');
          toast.info('Ausgaben-Formular geöffnet');
          console.log('📝 Navigiere zu Ausgaben-Formular');
          break;

        // TEAMS
        case 'create_team':
          navigate('/teams/new');
          toast.info('Team-Formular geöffnet');
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
              description: parameters.description || 'Per Minute Companion eingereicht',
              category: 'improvement',
              tags: [],
              priority: 'medium',
              expected_impact: 'medium',
              implementation_effort: 'medium'
            });
            await queryClient.invalidateQueries({ queryKey: ['innovation-ideas'] });
            toast.success('Idee eingereicht!');
            console.log('✅ Idee per Chat eingereicht:', parameters.title);
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
          console.log('⚠️ Unbekannte Aktion:', action, parameters);
      }

      return true;
    } catch (error) {
      console.error('❌ Fehler bei Aktion:', action, error);
      toast.error('Aktion konnte nicht ausgeführt werden');
      return false;
    }
  };

  return { executeAction };
};
