import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Heart, MessageSquare, Coffee, Target, ThumbsUp, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface FeedbackItem {
  id: string;
  from_user_name: string;
  to_user_name: string;
  feedback_type: 'kudos' | 'constructive' | '1on1_note' | 'pulse_response';
  subject?: string;
  content: string;
  visibility: 'private' | 'manager' | 'hr' | 'public';
  created_at: string;
  tags: string[];
}

export const ContinuousFeedback = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'kudos',
    recipient: '',
    subject: '',
    content: '',
    visibility: 'manager'
  });

  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['continuous-feedback', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('continuous_feedback')
        .select(`
          id,
          feedback_type,
          subject,
          content,
          visibility,
          created_at,
          tags,
          from_employee:employees!continuous_feedback_from_employee_id_fkey(first_name, last_name),
          to_employee:employees!continuous_feedback_to_employee_id_fkey(first_name, last_name)
        `)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        return [];
      }

      return (data || []).map((feedback: any): FeedbackItem => ({
        id: feedback.id,
        from_user_name: feedback.from_employee 
          ? `${feedback.from_employee.first_name || ''} ${feedback.from_employee.last_name || ''}`.trim() || 'Unbekannt'
          : 'Unbekannt',
        to_user_name: feedback.to_employee 
          ? `${feedback.to_employee.first_name || ''} ${feedback.to_employee.last_name || ''}`.trim() || 'Unbekannt'
          : 'Unbekannt',
        feedback_type: feedback.feedback_type || 'kudos',
        subject: feedback.subject,
        content: feedback.content || '',
        visibility: feedback.visibility || 'private',
        created_at: feedback.created_at,
        tags: feedback.tags || []
      }));
    },
    enabled: !!currentCompanyId
  });

  const getFeedbackTypeIcon = (type: FeedbackItem['feedback_type']) => {
    switch (type) {
      case 'kudos': return <Heart className="h-4 w-4" />;
      case 'constructive': return <MessageSquare className="h-4 w-4" />;
      case '1on1_note': return <Coffee className="h-4 w-4" />;
      case 'pulse_response': return <Target className="h-4 w-4" />;
    }
  };

  const getFeedbackTypeColor = (type: FeedbackItem['feedback_type']) => {
    switch (type) {
      case 'kudos': return 'bg-red-100 text-red-800';
      case 'constructive': return 'bg-blue-100 text-blue-800';
      case '1on1_note': return 'bg-green-100 text-green-800';
      case 'pulse_response': return 'bg-purple-100 text-purple-800';
    }
  };

  const getFeedbackTypeName = (type: FeedbackItem['feedback_type']) => {
    switch (type) {
      case 'kudos': return 'Kudos';
      case 'constructive': return 'Konstruktiv';
      case '1on1_note': return '1:1 Notiz';
      case 'pulse_response': return 'Pulse';
    }
  };

  const getVisibilityColor = (visibility: FeedbackItem['visibility']) => {
    switch (visibility) {
      case 'private': return 'bg-gray-100 text-gray-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (feedbackFilter === 'all') return true;
    return feedback.feedback_type === feedbackFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Kontinuierliches Feedback</h2>
          <p className="text-sm text-gray-500">Kudos, 1:1 Notizen und strukturiertes Feedback</p>
        </div>
        <Button onClick={() => setShowFeedbackForm(!showFeedbackForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Feedback geben
        </Button>
      </div>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neues Feedback</CardTitle>
            <CardDescription>Geben Sie konstruktives Feedback oder Kudos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={newFeedback.type} onValueChange={(value) => setNewFeedback({...newFeedback, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Feedback-Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kudos">Kudos</SelectItem>
                  <SelectItem value="constructive">Konstruktives Feedback</SelectItem>
                  <SelectItem value="1on1_note">1:1 Notiz</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Empfänger auswählen..."
                value={newFeedback.recipient}
                onChange={(e) => setNewFeedback({...newFeedback, recipient: e.target.value})}
              />
            </div>

            <Input
              placeholder="Betreff (optional)"
              value={newFeedback.subject}
              onChange={(e) => setNewFeedback({...newFeedback, subject: e.target.value})}
            />

            <Textarea
              placeholder="Ihr Feedback..."
              value={newFeedback.content}
              onChange={(e) => setNewFeedback({...newFeedback, content: e.target.value})}
              rows={4}
            />

            <div className="flex justify-between items-center">
              <Select value={newFeedback.visibility} onValueChange={(value) => setNewFeedback({...newFeedback, visibility: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sichtbarkeit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privat</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="public">Öffentlich</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
                  Abbrechen
                </Button>
                <Button>
                  Feedback senden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Button 
            variant={feedbackFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFeedbackFilter('all')}
          >
            Alle
          </Button>
          <Button 
            variant={feedbackFilter === 'kudos' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFeedbackFilter('kudos')}
          >
            <Heart className="h-3 w-3 mr-1" />
            Kudos
          </Button>
          <Button 
            variant={feedbackFilter === 'constructive' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFeedbackFilter('constructive')}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Konstruktiv
          </Button>
          <Button 
            variant={feedbackFilter === '1on1_note' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFeedbackFilter('1on1_note')}
          >
            <Coffee className="h-3 w-3 mr-1" />
            1:1 Notizen
          </Button>
        </div>
      </div>

      {/* Feedback Liste */}
      {filteredFeedbacks.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Kein Feedback vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Es wurde noch kein Feedback erstellt.
              </p>
              <Button onClick={() => setShowFeedbackForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Feedback geben
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`${getFeedbackTypeColor(feedback.feedback_type)} border-0`}
                      >
                        {getFeedbackTypeIcon(feedback.feedback_type)}
                        <span className="ml-1">{getFeedbackTypeName(feedback.feedback_type)}</span>
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getVisibilityColor(feedback.visibility)} border-0 text-xs`}
                      >
                        {feedback.visibility}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(feedback.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>

                  {feedback.subject && (
                    <h4 className="font-medium text-lg">{feedback.subject}</h4>
                  )}

                  <p className="text-gray-700 leading-relaxed">{feedback.content}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Von: {feedback.from_user_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        An: {feedback.to_user_name}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {feedback.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {feedback.feedback_type === 'kudos' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Gefällt mir
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Antworten
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {feedbacks.filter(f => f.feedback_type === 'kudos').length}
            </div>
            <p className="text-sm text-gray-600">Kudos erhalten</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {feedbacks.filter(f => f.feedback_type === 'constructive').length}
            </div>
            <p className="text-sm text-gray-600">Konstruktives Feedback</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {feedbacks.filter(f => f.feedback_type === '1on1_note').length}
            </div>
            <p className="text-sm text-gray-600">1:1 Notizen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {feedbacks.filter(f => f.visibility === 'public').length}
            </div>
            <p className="text-sm text-gray-600">Öffentlich sichtbar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
