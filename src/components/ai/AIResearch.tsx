import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lightbulb, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const AIResearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    suggestion_title: '',
    description: '',
    target_module: '',
    expected_benefit: '',
    priority: 'medium',
    use_case_type: ''
  });

  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const submitSuggestion = useMutation({
    mutationFn: async (suggestionData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { data, error } = await supabase
        .from('ai_suggestions')
        .insert({
          ...suggestionData,
          submitted_by: user.id,
          employee_name: user.user_metadata?.full_name || user.email,
          department: 'IT',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Vorschlag erfolgreich eingereicht');
      setOpen(false);
      setFormData({
        suggestion_title: '',
        description: '',
        target_module: '',
        expected_benefit: '',
        priority: 'medium',
        use_case_type: ''
      });
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] });
    },
    onError: (error) => {
      console.error('Fehler beim Einreichen des Vorschlags:', error);
      toast.error('Fehler beim Einreichen des Vorschlags');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.suggestion_title || !formData.description) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    submitSuggestion.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KI-Forschung & Vorschläge</h2>
          <p className="text-muted-foreground">Entdecken Sie neue KI-Anwendungsfälle und reichen Sie Verbesserungsvorschläge ein</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Lightbulb className="mr-2 h-4 w-4" />
              Neuer Vorschlag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>KI-Verbesserungsvorschlag einreichen</DialogTitle>
              <DialogDescription>Teilen Sie Ihre Ideen zur Verbesserung unserer KI-Nutzung mit</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.suggestion_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggestion_title: e.target.value }))}
                  placeholder="Kurzer, prägnanter Titel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detaillierte Beschreibung des Vorschlags"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zielmodul</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, target_module: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Modul auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">Personal</SelectItem>
                      <SelectItem value="finance">Finanzen</SelectItem>
                      <SelectItem value="projects">Projekte</SelectItem>
                      <SelectItem value="documents">Dokumente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priorität</Label>
                  <Select defaultValue="medium" onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Hoch</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="low">Niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
                <Button type="submit" disabled={submitSuggestion.isPending}>
                  {submitSuggestion.isPending ? 'Wird eingereicht...' : 'Einreichen'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{suggestion.suggestion_title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>von {suggestion.employee_name}</span>
                    <Badge variant="outline">{suggestion.department}</Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'outline'}>
                    {suggestion.priority}
                  </Badge>
                  <Badge variant={suggestion.status === 'approved' ? 'default' : 'outline'}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(suggestion.status)}
                      <span>{suggestion.status === 'approved' ? 'Genehmigt' : 'Ausstehend'}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              <div className="text-sm text-muted-foreground mt-4">
                Eingereicht am {new Date(suggestion.created_at).toLocaleDateString('de-DE')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIResearch;