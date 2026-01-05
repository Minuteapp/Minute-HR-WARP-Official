import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  UserX, Calendar, CheckCircle2, Clock, AlertTriangle, 
  FileText, Shield, Laptop, CreditCard, Key, Users, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface OffboardingTabProps {
  employeeId: string;
}

const DEFAULT_CHECKLIST_ITEMS = [
  { title: 'IT-Zugänge sperren', description: 'E-Mail, VPN, Systeme deaktivieren', category: 'it' },
  { title: 'Hardware zurückgeben', description: 'Laptop, Handy, Zubehör', category: 'equipment' },
  { title: 'Ausweise einziehen', description: 'Mitarbeiterausweis, Schlüssel, Zugangskarten', category: 'access' },
  { title: 'Wissenstransfer durchführen', description: 'Dokumentation, Übergabe an Nachfolger', category: 'knowledge_transfer' },
  { title: 'Firmenwagen zurückgeben', description: 'Fahrzeug und Dokumente', category: 'equipment' },
  { title: 'Arbeitszeugnis erstellen', description: 'Finales Arbeitszeugnis', category: 'hr' },
  { title: 'Letzte Gehaltsabrechnung', description: 'Resturlaub, offene Ansprüche', category: 'finance' },
  { title: 'Exit-Interview planen', description: 'Feedback-Gespräch vereinbaren', category: 'hr' },
  { title: 'Versicherungen kündigen', description: 'Betriebliche Versicherungen beenden', category: 'finance' },
  { title: 'Datenschutz-Erklärung', description: 'Vertraulichkeitsverpflichtung erneuern', category: 'hr' },
];

const CATEGORY_ICONS: Record<string, any> = {
  hr: FileText,
  it: Laptop,
  finance: CreditCard,
  equipment: Briefcase,
  access: Key,
  knowledge_transfer: Users,
};

const CATEGORY_LABELS: Record<string, string> = {
  hr: 'HR',
  it: 'IT',
  finance: 'Finanzen',
  equipment: 'Equipment',
  access: 'Zugänge',
  knowledge_transfer: 'Wissenstransfer',
};

export const OffboardingTab = ({ employeeId }: OffboardingTabProps) => {
  const queryClient = useQueryClient();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Offboarding-Prozess laden
  const { data: offboardingProcess, isLoading: isLoadingProcess } = useQuery({
    queryKey: ['offboarding-process', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offboarding_processes')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Checkliste laden
  const { data: checklistItems = [], isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['offboarding-checklist', offboardingProcess?.id],
    queryFn: async () => {
      if (!offboardingProcess?.id) return [];
      
      const { data, error } = await supabase
        .from('offboarding_checklists')
        .select('*')
        .eq('process_id', offboardingProcess.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!offboardingProcess?.id,
  });

  // Exit-Interview laden
  const { data: exitInterview } = useQuery({
    queryKey: ['offboarding-exit-interview', offboardingProcess?.id],
    queryFn: async () => {
      if (!offboardingProcess?.id) return null;
      
      const { data, error } = await supabase
        .from('offboarding_exit_interviews')
        .select('*')
        .eq('process_id', offboardingProcess.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!offboardingProcess?.id,
  });

  // Offboarding starten
  const startOffboardingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      // Prozess erstellen
      const { data: process, error: processError } = await supabase
        .from('offboarding_processes')
        .insert({
          employee_id: employeeId,
          initiated_by: user.id,
          last_working_day: lastWorkingDay || null,
          reason: reason || null,
          notes: notes || null,
          status: 'in_progress',
        })
        .select()
        .single();

      if (processError) throw processError;

      // Standard-Checkliste erstellen
      const checklistInserts = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
        process_id: process.id,
        title: item.title,
        description: item.description,
        category: item.category,
        sort_order: index,
        is_completed: false,
      }));

      const { error: checklistError } = await supabase
        .from('offboarding_checklists')
        .insert(checklistInserts);

      if (checklistError) throw checklistError;

      return process;
    },
    onSuccess: () => {
      toast.success('Offboarding-Prozess wurde gestartet');
      queryClient.invalidateQueries({ queryKey: ['offboarding-process', employeeId] });
      setShowStartDialog(false);
    },
    onError: (error) => {
      toast.error('Fehler beim Starten des Offboarding-Prozesses');
      console.error(error);
    },
  });

  // Checklisten-Item aktualisieren
  const updateChecklistItemMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('offboarding_checklists')
        .update({
          is_completed: isCompleted,
          completed_date: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? user?.id : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offboarding-checklist', offboardingProcess?.id] });
    },
  });

  // Prozess abschließen
  const completeProcessMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('offboarding_processes')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', offboardingProcess?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Offboarding-Prozess wurde abgeschlossen');
      queryClient.invalidateQueries({ queryKey: ['offboarding-process', employeeId] });
    },
  });

  const completedCount = checklistItems.filter(item => item.is_completed).length;
  const progress = checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Ausstehend</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><AlertTriangle className="w-3 h-3 mr-1" />In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Abgeschlossen</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600">Abgebrochen</Badge>;
      default:
        return null;
    }
  };

  if (isLoadingProcess) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Kein aktiver Offboarding-Prozess
  if (!offboardingProcess) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <UserX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Kein aktiver Offboarding-Prozess</h3>
          <p className="text-muted-foreground mb-6">
            Es wurde noch kein Offboarding-Prozess für diesen Mitarbeiter gestartet.
          </p>

          <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <UserX className="w-4 h-4" />
                Offboarding-Prozess starten
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-destructive" />
                  Offboarding-Prozess starten
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie den Offboarding-Prozess für diesen Mitarbeiter beginnen? 
                  Dieser Prozess umfasst alle notwendigen Schritte für das Ausscheiden.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="lastWorkingDay">Letzter Arbeitstag</Label>
                  <Input
                    id="lastWorkingDay"
                    type="date"
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Grund</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grund auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">Eigenkündigung</SelectItem>
                      <SelectItem value="termination">Kündigung durch Arbeitgeber</SelectItem>
                      <SelectItem value="mutual_agreement">Aufhebungsvertrag</SelectItem>
                      <SelectItem value="retirement">Ruhestand</SelectItem>
                      <SelectItem value="end_of_contract">Vertragsende (befristet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notizen (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Zusätzliche Informationen..."
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => startOffboardingMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Prozess starten
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  // Aktiver Offboarding-Prozess
  return (
    <div className="space-y-6">
      {/* Status-Übersicht */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Offboarding-Prozess
              </CardTitle>
              <CardDescription>
                Gestartet am {format(new Date(offboardingProcess.created_at), 'dd. MMMM yyyy', { locale: de })}
              </CardDescription>
            </div>
            {getStatusBadge(offboardingProcess.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Letzter Arbeitstag</p>
              <p className="font-semibold">
                {offboardingProcess.last_working_day 
                  ? format(new Date(offboardingProcess.last_working_day), 'dd.MM.yyyy')
                  : 'Nicht festgelegt'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Grund</p>
              <p className="font-semibold">
                {offboardingProcess.reason === 'resignation' && 'Eigenkündigung'}
                {offboardingProcess.reason === 'termination' && 'Kündigung'}
                {offboardingProcess.reason === 'mutual_agreement' && 'Aufhebungsvertrag'}
                {offboardingProcess.reason === 'retirement' && 'Ruhestand'}
                {offboardingProcess.reason === 'end_of_contract' && 'Vertragsende'}
                {!offboardingProcess.reason && 'Nicht angegeben'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Fortschritt</p>
              <p className="font-semibold">{completedCount} / {checklistItems.length}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Gesamtfortschritt</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Checkliste nach Kategorien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Offboarding-Checkliste
          </CardTitle>
          <CardDescription>
            Alle Aufgaben für einen vollständigen Offboarding-Prozess
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
              const categoryItems = checklistItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              
              const CategoryIcon = CATEGORY_ICONS[category] || FileText;
              const completedInCategory = categoryItems.filter(item => item.is_completed).length;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {completedInCategory}/{categoryItems.length}
                    </Badge>
                  </div>
                  <div className="space-y-2 pl-6">
                    {categoryItems.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={(checked) => 
                            updateChecklistItemMutation.mutate({ 
                              id: item.id, 
                              isCompleted: checked as boolean 
                            })
                          }
                          disabled={offboardingProcess.status === 'completed'}
                        />
                        <div className="flex-1">
                          <p className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        {item.is_completed && item.completed_date && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.completed_date), 'dd.MM.yyyy')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              );
            })}
          </div>

          {offboardingProcess.status === 'in_progress' && progress === 100 && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={() => completeProcessMutation.mutate()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Offboarding-Prozess abschließen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exit-Interview */}
      {exitInterview && (
        <Card>
          <CardHeader>
            <CardTitle>Exit-Interview</CardTitle>
            <CardDescription>
              Geplantes Abschlussgespräch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Termin</p>
              <p className="font-medium">
                {exitInterview.scheduled_date 
                  ? format(new Date(exitInterview.scheduled_date), 'dd. MMMM yyyy, HH:mm', { locale: de })
                  : 'Noch nicht geplant'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notizen */}
      {offboardingProcess.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{offboardingProcess.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
