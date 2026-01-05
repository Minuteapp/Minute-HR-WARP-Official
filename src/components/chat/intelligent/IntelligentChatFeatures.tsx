
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Users, 
  Archive, 
  Bell, 
  Bot, 
  Check, 
  Clock,
  UserPlus,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useIntelligentCommunication } from '@/hooks/chat/useIntelligentCommunication';
import { useToast } from '@/hooks/use-toast';

interface IntelligentChatFeaturesProps {
  projectId?: string;
  channelId?: string;
  eventId?: string;
}

const IntelligentChatFeatures: React.FC<IntelligentChatFeaturesProps> = ({
  projectId,
  channelId,
  eventId
}) => {
  const {
    notifications,
    chatArchives,
    meetingSuggestions,
    loading,
    createProjectChannel,
    createTaskNotification,
    archiveProjectChat,
    generateMeetingParticipantSuggestions,
    markNotificationAsRead
  } = useIntelligentCommunication();

  const [newProjectName, setNewProjectName] = useState('');
  const [archiveInProgress, setArchiveInProgress] = useState(false);
  const { toast } = useToast();

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleCreateProjectChannel = async () => {
    if (!projectId || !newProjectName.trim()) {
      toast({
        title: "Fehler",
        description: "Projekt-ID und Name sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    await createProjectChannel(projectId, newProjectName);
    setNewProjectName('');
  };

  const handleArchiveChat = async () => {
    if (!projectId || !channelId) {
      toast({
        title: "Fehler",
        description: "Projekt-ID und Kanal-ID sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    setArchiveInProgress(true);
    await archiveProjectChat(projectId, channelId);
    setArchiveInProgress(false);
  };

  const handleGenerateMeetingSuggestions = async () => {
    if (!eventId) {
      toast({
        title: "Fehler",
        description: "Event-ID ist erforderlich.",
        variant: "destructive"
      });
      return;
    }

    await generateMeetingParticipantSuggestions(eventId, {
      project_id: projectId,
      department: 'Development' // Kann dynamisch bestimmt werden
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Intelligente Chat-Features</h2>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="channels">
            <MessageSquare className="h-4 w-4 mr-1" />
            Projekt-Kanäle
          </TabsTrigger>
          <TabsTrigger value="archives">
            <Archive className="h-4 w-4 mr-1" />
            Chat-Archive
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Users className="h-4 w-4 mr-1" />
            Meeting-Vorschläge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Intelligente Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Benachrichtigungen vorhanden</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge variant={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {notification.source_type === 'task' && (
                            <Badge variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              Task
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.sent_at).toLocaleString('de-DE')}
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Automatische Projekt-Kanäle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Projekt-Name eingeben..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateProjectChannel}
                    disabled={loading || !newProjectName.trim()}
                  >
                    {loading ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Kanal erstellen
                  </Button>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <strong>Automatische Kanal-Erstellung:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Erstellt automatisch einen Chat-Kanal für neue Projekte</li>
                        <li>• Lädt automatisch alle Projektmitglieder ein</li>
                        <li>• Konfiguriert passende Berechtigungen</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archives">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Chat-Archivierung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelId && projectId && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Archive className="h-4 w-4 text-yellow-600" />
                      <strong className="text-yellow-800">Chat archivieren</strong>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Archiviert alle Nachrichten dieses Kanals für die Projekt-Dokumentation.
                    </p>
                    <Button
                      onClick={handleArchiveChat}
                      disabled={archiveInProgress}
                      variant="outline"
                      className="border-yellow-300 hover:bg-yellow-100"
                    >
                      {archiveInProgress ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Archive className="h-4 w-4 mr-2" />
                      )}
                      Chat archivieren
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Vorhandene Archive:</h4>
                  {chatArchives.length === 0 ? (
                    <p className="text-sm text-gray-500">Keine Archive vorhanden</p>
                  ) : (
                    chatArchives.map((archive) => (
                      <div
                        key={archive.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            Archiv vom {new Date(archive.archive_date).toLocaleDateString('de-DE')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {archive.message_count} Nachrichten • {archive.participants.length} Teilnehmer
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Anzeigen
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Meeting-Teilnehmer-Vorschläge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventId && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-4 w-4 text-green-600" />
                      <strong className="text-green-800">Vorschläge generieren</strong>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Generiert intelligente Vorschläge für Meeting-Teilnehmer basierend auf Projekt, Abteilung und vorherigen Meetings.
                    </p>
                    <Button
                      onClick={handleGenerateMeetingSuggestions}
                      disabled={loading}
                      variant="outline"
                      className="border-green-300 hover:bg-green-100"
                    >
                      {loading ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Vorschläge generieren
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {meetingSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Keine Teilnehmer-Vorschläge vorhanden</p>
                    </div>
                  ) : (
                    meetingSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Teilnehmer-Vorschlag</span>
                            <Badge
                              variant="outline"
                              className={getConfidenceColor(suggestion.confidence_score)}
                            >
                              {Math.round(suggestion.confidence_score * 100)}% Konfidenz
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {suggestion.suggestion_reason}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            Typ: {suggestion.suggestion_type.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {suggestion.accepted === null && (
                            <>
                              <Button size="sm" variant="outline">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {suggestion.accepted === true && (
                            <Badge variant="default">Akzeptiert</Badge>
                          )}
                          {suggestion.accepted === false && (
                            <Badge variant="secondary">Abgelehnt</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentChatFeatures;
