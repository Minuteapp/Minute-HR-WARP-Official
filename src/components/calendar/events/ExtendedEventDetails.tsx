
import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarCategory, CalendarInvitation, CalendarComment } from '@/types/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MapPin, 
  Clock, 
  Bell, 
  MessageSquare, 
  FileText, 
  Video,
  Shield,
  AlertTriangle,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { calendarService } from '@/services/calendarService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ExtendedEventDetailsProps {
  event: CalendarEvent;
  onUpdate?: () => void;
}

const ExtendedEventDetails = ({ event, onUpdate }: ExtendedEventDetailsProps) => {
  const [categories, setCategories] = useState<CalendarCategory[]>([]);
  const [comments, setComments] = useState<CalendarComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    loadCategories();
    if (event.comments) {
      setComments(event.comments);
    }
  }, [event]);

  const loadCategories = async () => {
    try {
      const data = await calendarService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsAddingComment(true);
      await calendarService.addComment(event.id, newComment);
      toast.success('Kommentar hinzugefügt');
      setNewComment('');
      onUpdate?.();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kommentars:', error);
      toast.error('Kommentar konnte nicht hinzugefügt werden');
    } finally {
      setIsAddingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return 'Mittel';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Shield className="h-4 w-4" />;
      case 'confidential': return <AlertTriangle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const category = categories.find(cat => cat.id === event.category_id);

  return (
    <div className="space-y-6">
      {/* Basis-Informationen */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {format(new Date(event.start), 'PPP p', { locale: de })} - {format(new Date(event.end), 'p', { locale: de })}
                </span>
                {event.isAllDay && (
                  <Badge variant="secondary" className="text-xs">Ganztägig</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {event.priority && (
                <Badge className={getPriorityColor(event.priority || 'medium')}>
                  {getPriorityLabel(event.priority || 'medium')}
                </Badge>
              )}
              {event.visibility && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  {getVisibilityIcon(event.visibility)}
                  <span className="capitalize">{event.visibility}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Beschreibung</h4>
              <p className="text-gray-600">{event.description}</p>
            </div>
          )}

          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          {category && (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          )}

          {event.meeting_url && (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-500" />
              <a 
                href={event.meeting_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Meeting beitreten
              </a>
            </div>
          )}

          {event.max_attendees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Max. {event.max_attendees} Teilnehmer</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teilnehmer und Einladungen */}
      {event.participants && event.participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teilnehmer ({event.participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{participant}</span>
                  <Badge variant="outline" className="text-xs">
                    {event.invitations?.find(inv => inv.invitee_email === participant)?.status || 'pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erinnerungen */}
      {event.reminders && event.reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Erinnerungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.reminders.map((reminder, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{reminder.reminder_time} vorher</span>
                  <Badge variant="outline" className="text-xs">
                    {reminder.reminder_method}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kommentare */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kommentare ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{comment.comment}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{format(new Date(comment.created_at), 'PPp', { locale: de })}</span>
                    {comment.is_private && (
                      <Badge variant="secondary" className="text-xs">Privat</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Textarea
              placeholder="Kommentar hinzufügen..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
              >
                {isAddingComment ? 'Wird hinzugefügt...' : 'Kommentar hinzufügen'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dokumente */}
      {event.documents && event.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Anhänge ({event.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExtendedEventDetails;
