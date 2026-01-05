
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectChannel {
  id: string;
  project_id: string;
  channel_id: string;
  created_at: string;
  auto_created: boolean;
}

export interface IntelligentNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  source_type: string;
  source_id: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  sent_at: string;
  metadata: Record<string, any>;
}

export interface ChatArchive {
  id: string;
  project_id: string;
  channel_id: string;
  archive_date: string;
  content: string;
  message_count: number;
  participants: any[];
  file_path?: string;
}

export interface MeetingParticipantSuggestion {
  id: string;
  event_id: string;
  suggested_user_id: string;
  suggestion_reason: string;
  confidence_score: number;
  suggestion_type: 'project_based' | 'skill_based' | 'previous_meetings' | 'department';
  metadata: Record<string, any>;
  accepted?: boolean;
  created_at: string;
}

export const useIntelligentCommunication = () => {
  const [projectChannels, setProjectChannels] = useState<ProjectChannel[]>([]);
  const [notifications, setNotifications] = useState<IntelligentNotification[]>([]);
  const [chatArchives, setChatArchives] = useState<ChatArchive[]>([]);
  const [meetingSuggestions, setMeetingSuggestions] = useState<MeetingParticipantSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Automatische Projekt-Kanal-Erstellung
  const createProjectChannel = async (projectId: string, projectName: string) => {
    try {
      setLoading(true);
      
      // Erstelle neuen Kanal
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert({
          name: `${projectName} - Projektkanal`,
          description: `Automatisch erstellter Kanal für Projekt: ${projectName}`,
          type: 'project',
          is_public: false,
          metadata: { project_id: projectId, auto_created: true }
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Verknüpfe Kanal mit Projekt
      const { data: projectChannel, error: linkError } = await supabase
        .from('project_channels')
        .insert({
          project_id: projectId,
          channel_id: channel.id,
          auto_created: true
        })
        .select()
        .single();

      if (linkError) throw linkError;

      setProjectChannels(prev => [...prev, projectChannel]);
      
      toast({
        title: "Projekt-Kanal erstellt",
        description: `Automatischer Chat-Kanal für das Projekt wurde erstellt.`
      });

      return projectChannel;
    } catch (error) {
      console.error('Fehler beim Erstellen des Projekt-Kanals:', error);
      toast({
        title: "Fehler",
        description: "Projekt-Kanal konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Intelligente Benachrichtigungen für Task-Updates
  const createTaskNotification = async (
    taskId: string,
    taskTitle: string,
    notificationType: 'task_assigned' | 'task_completed' | 'task_overdue' | 'task_comment',
    recipientIds: string[],
    metadata: Record<string, any> = {}
  ) => {
    try {
      const notificationData = recipientIds.map(userId => ({
        user_id: userId,
        notification_type: notificationType,
        title: getNotificationTitle(notificationType, taskTitle),
        message: getNotificationMessage(notificationType, taskTitle),
        source_type: 'task',
        source_id: taskId,
        priority: getNotificationPriority(notificationType),
        metadata
      }));

      const { data, error } = await supabase
        .from('intelligent_notifications')
        .insert(notificationData)
        .select();

      if (error) throw error;

      console.log(`${data.length} Benachrichtigungen für Task "${taskTitle}" erstellt`);
      return data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Task-Benachrichtigung:', error);
    }
  };

  // Chat-Archivierung für Projekt-Dokumentation
  const archiveProjectChat = async (projectId: string, channelId: string) => {
    try {
      setLoading(true);

      // Hole Chat-Nachrichten
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Erstelle Archiv-Content
      const archiveContent = messages.map(msg => 
        `[${new Date(msg.created_at).toLocaleString('de-DE')}] ${msg.sender_id}: ${msg.content}`
      ).join('\n');

      // Speichere Archiv
      const { data: archive, error: archiveError } = await supabase
        .from('chat_archives')
        .insert({
          project_id: projectId,
          channel_id: channelId,
          content: archiveContent,
          message_count: messages.length,
          participants: [...new Set(messages.map(m => m.sender_id))]
        })
        .select()
        .single();

      if (archiveError) throw archiveError;

      setChatArchives(prev => [...prev, archive]);
      
      toast({
        title: "Chat archiviert",
        description: `${messages.length} Nachrichten wurden für die Projekt-Dokumentation archiviert.`
      });

      return archive;
    } catch (error) {
      console.error('Fehler beim Archivieren des Chats:', error);
      toast({
        title: "Fehler",
        description: "Chat konnte nicht archiviert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Meeting-Teilnehmer-Vorschläge
  const generateMeetingParticipantSuggestions = async (eventId: string, eventMetadata: any) => {
    try {
      setLoading(true);

      const suggestions: Omit<MeetingParticipantSuggestion, 'id' | 'created_at'>[] = [];

      // Projekt-basierte Vorschläge
      if (eventMetadata.project_id) {
        const { data: projectMembers } = await supabase
          .from('projects')
          .select('team_members, owner_id')
          .eq('id', eventMetadata.project_id)
          .single();

        if (projectMembers) {
          const allMembers = [...(projectMembers.team_members || []), projectMembers.owner_id];
          allMembers.forEach(userId => {
            if (userId) {
              suggestions.push({
                event_id: eventId,
                suggested_user_id: userId,
                suggestion_reason: 'Projektmitglied',
                confidence_score: 0.8,
                suggestion_type: 'project_based',
                metadata: { project_id: eventMetadata.project_id }
              });
            }
          });
        }
      }

      // Abteilungsbasierte Vorschläge
      if (eventMetadata.department) {
        const { data: deptEmployees } = await supabase
          .from('employees')
          .select('id')
          .eq('department', eventMetadata.department)
          .limit(10);

        deptEmployees?.forEach(emp => {
          suggestions.push({
            event_id: eventId,
            suggested_user_id: emp.id,
            suggestion_reason: `Abteilung: ${eventMetadata.department}`,
            confidence_score: 0.6,
            suggestion_type: 'department',
            metadata: { department: eventMetadata.department }
          });
        });
      }

      if (suggestions.length > 0) {
        const { data, error } = await supabase
          .from('meeting_participant_suggestions')
          .insert(suggestions)
          .select();

        if (error) throw error;

        setMeetingSuggestions(prev => [...prev, ...data]);
        
        toast({
          title: "Teilnehmer-Vorschläge generiert",
          description: `${data.length} Vorschläge für Meeting-Teilnehmer wurden erstellt.`
        });

        return data;
      }
    } catch (error) {
      console.error('Fehler beim Generieren der Meeting-Vorschläge:', error);
      toast({
        title: "Fehler",
        description: "Meeting-Vorschläge konnten nicht generiert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Lade Daten
  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('intelligent_notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('intelligent_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Fehler beim Markieren der Benachrichtigung:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return {
    // State
    projectChannels,
    notifications,
    chatArchives,
    meetingSuggestions,
    loading,

    // Actions
    createProjectChannel,
    createTaskNotification,
    archiveProjectChat,
    generateMeetingParticipantSuggestions,
    markNotificationAsRead,
    loadNotifications
  };
};

// Helper-Funktionen
const getNotificationTitle = (type: string, taskTitle: string): string => {
  switch (type) {
    case 'task_assigned':
      return 'Neue Aufgabe zugewiesen';
    case 'task_completed':
      return 'Aufgabe abgeschlossen';
    case 'task_overdue':
      return 'Aufgabe überfällig';
    case 'task_comment':
      return 'Neuer Kommentar';
    default:
      return 'Task-Update';
  }
};

const getNotificationMessage = (type: string, taskTitle: string): string => {
  switch (type) {
    case 'task_assigned':
      return `Ihnen wurde die Aufgabe "${taskTitle}" zugewiesen.`;
    case 'task_completed':
      return `Die Aufgabe "${taskTitle}" wurde abgeschlossen.`;
    case 'task_overdue':
      return `Die Aufgabe "${taskTitle}" ist überfällig.`;
    case 'task_comment':
      return `Neuer Kommentar zur Aufgabe "${taskTitle}".`;
    default:
      return `Update zur Aufgabe "${taskTitle}".`;
  }
};

const getNotificationPriority = (type: string): 'low' | 'medium' | 'high' => {
  switch (type) {
    case 'task_overdue':
      return 'high';
    case 'task_assigned':
      return 'medium';
    default:
      return 'low';
  }
};
