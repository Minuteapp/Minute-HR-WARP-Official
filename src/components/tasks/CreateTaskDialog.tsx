import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sparkles, CalendarIcon, X, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import { useCurrentUser } from '@/integrations/supabase/hooks/useCurrentUser';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export const CreateTaskDialog = ({ open, onOpenChange, projectId }: CreateTaskDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenantCompany, isSuperAdmin } = useTenant();
  const { data: currentUser } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(projectId || '');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [recurring, setRecurring] = useState('none');

  // Hole verfügbare Mitarbeiter
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Echte Projekte aus der Datenbank laden
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      // company_id ermitteln - über Tenant-Kontext oder RPC
      let companyId = tenantCompany?.id || currentUser?.company_id || null;
      
      // Fallback: RPC-Funktion für effective company_id
      if (!companyId) {
        const { data: rpcCompanyId } = await supabase.rpc('get_effective_company_id');
        companyId = rpcCompanyId;
      }
      
      // company_id ist Pflicht in der DB (NOT NULL)
      if (!companyId) {
        toast({
          title: "Fehler",
          description: "Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Status mappen: UI verwendet in_progress, DB erwartet in-progress
      const dbStatus = status === 'in_progress' ? 'in-progress' : status;

      const { error } = await supabase
        .from('tasks')
        .insert({
          title,
          description: description || null,
          priority,
          status: dbStatus,
          assigned_to: assignee ? [assignee] : null,
          created_by: user.id,
          due_date: dueDate?.toISOString().split('T')[0] || null,
          tags: tags.length > 0 ? tags : null,
          company_id: companyId
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: `Die Aufgabe "${title}" wurde erfolgreich erstellt.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-overview'] });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Die Aufgabe konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProject(projectId || '');
    setAssignee('');
    setDueDate(undefined);
    setPriority('medium');
    setStatus('todo');
    setTags([]);
    setRecurring('none');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Neue Aufgabe erstellen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Erstellen Sie eine neue Aufgabe und weisen Sie sie einem Projekt und Mitarbeiter zu.
          </p>
        </DialogHeader>

        {/* KI-Vorschläge Box - nur anzeigen wenn Titel eingegeben */}
        {title.trim().length > 3 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-primary">KI-Analyse aktiv</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Basierend auf Ihrem Titel "{title}" werden nach dem Erstellen passende Vorschläge generiert.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Titel */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Vertrag für Neueinstellung prüfen"
            />
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detaillierte Beschreibung der Aufgabe..."
              rows={3}
            />
          </div>

          {/* Projekt & Verantwortlicher */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projekt</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Projekt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Keine Projekte vorhanden
                    </div>
                  ) : (
                    projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Verantwortlicher</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nicht zugewiesen</SelectItem>
                  {employees.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Keine Mitarbeiter vorhanden
                    </div>
                  ) : (
                    employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fälligkeitsdatum & Priorität */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fälligkeitsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="pointer-events-auto"
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={priority} onValueChange={setPriority}>
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

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag hinzufügen..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Hinzufügen
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Wiederkehrende Aufgabe */}
          <div className="space-y-2">
            <Label>Wiederkehrende Aufgabe</Label>
            <Select value={recurring} onValueChange={setRecurring}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Wiederholung</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              'Aufgabe erstellen'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
