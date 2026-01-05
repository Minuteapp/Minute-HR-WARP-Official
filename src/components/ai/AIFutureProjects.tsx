import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

const AIFutureProjects: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    process_name: '',
    description: '',
    current_module: '',
    automation_type: '',
    current_time_spent_hours: 0,
    potential_time_saved_hours: 0,
    implementation_cost: 0,
    complexity_level: 'medium',
    priority: 'medium'
  });

  const queryClient = useQueryClient();

  const { data: automations = [], isLoading: automationsLoading } = useQuery({
    queryKey: ['ai-automations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_automations')
        .select('*')
        .order('roi_percentage', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: forecasts = [], isLoading: forecastsLoading } = useQuery({
    queryKey: ['ai-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_forecasts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const createAutomation = useMutation({
    mutationFn: async (automationData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const annualSavings = (automationData.potential_time_saved_hours * 52 * 50);
      const roiPercentage = automationData.implementation_cost > 0 ? 
        ((annualSavings - automationData.implementation_cost) / automationData.implementation_cost) * 100 : 0;

      const { data, error } = await supabase
        .from('ai_automations')
        .insert({
          ...automationData,
          annual_savings: annualSavings,
          roi_percentage: roiPercentage,
          automation_confidence_score: 0.8,
          status: 'suggested',
          implementation_priority: automationData.priority
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Automatisierungsvorschlag erfolgreich erstellt');
      setOpen(false);
      setFormData({
        process_name: '',
        description: '',
        current_module: '',
        automation_type: '',
        current_time_spent_hours: 0,
        potential_time_saved_hours: 0,
        implementation_cost: 0,
        complexity_level: 'medium',
        priority: 'medium'
      });
      queryClient.invalidateQueries({ queryKey: ['ai-automations'] });
    },
    onError: (error) => {
      console.error('Fehler beim Erstellen der Automatisierung:', error);
      toast.error('Fehler beim Erstellen des Automatisierungsvorschlags');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.process_name || !formData.description) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    createAutomation.mutate(formData);
  };

  const totalPotentialSavings = automations.reduce((sum, auto) => sum + (auto.annual_savings || 0), 0);
  const averageROI = automations.length > 0 ? 
    automations.reduce((sum, auto) => sum + (auto.roi_percentage || 0), 0) / automations.length : 0;
  const totalTimeSaved = automations.reduce((sum, auto) => sum + (auto.potential_time_saved_hours || 0), 0);

  const roiData = automations.map((auto, index) => ({
    name: auto.process_name.substring(0, 20) + '...',
    roi: auto.roi_percentage || 0,
    savings: auto.annual_savings || 0
  })).slice(0, 10);

  if (automationsLoading || forecastsLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KI-Zukunftsprojekte</h2>
          <p className="text-muted-foreground">Automatisierungsmöglichkeiten und Zukunftsprognosen</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Rocket className="mr-2 h-4 w-4" />
              Neue Automatisierung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Automatisierungsvorschlag erstellen</DialogTitle>
              <DialogDescription>Identifizieren Sie Prozesse, die für KI-Automatisierung geeignet sind</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="process_name">Prozessname *</Label>
                <Input
                  id="process_name"
                  value={formData.process_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, process_name: e.target.value }))}
                  placeholder="z.B. Rechnungsverarbeitung"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detaillierte Beschreibung des Automatisierungsprozesses"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aktueller Zeitaufwand (h/Woche)</Label>
                  <Input
                    type="number"
                    value={formData.current_time_spent_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_time_spent_hours: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Potenzielle Zeitersparnis (h/Woche)</Label>
                  <Input
                    type="number"
                    value={formData.potential_time_saved_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, potential_time_saved_hours: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
                <Button type="submit" disabled={createAutomation.isPending}>
                  {createAutomation.isPending ? 'Wird erstellt...' : 'Erstellen'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potenzielle Einsparungen</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPotentialSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">pro Jahr bei Umsetzung aller Projekte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittlicher ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Return on Investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zeitersparnis gesamt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeSaved}h</div>
            <p className="text-xs text-muted-foreground">pro Woche bei Umsetzung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">
              {automations.filter(a => a.status === 'approved').length} genehmigt
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="automations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automations">Automatisierungsprojekte</TabsTrigger>
          <TabsTrigger value="analytics">ROI-Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automations">
          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{automation.process_name}</CardTitle>
                      <CardDescription>
                        {automation.current_module && (
                          <Badge variant="outline" className="mr-2">{automation.current_module}</Badge>
                        )}
                        <Badge variant={automation.status === 'implemented' ? 'default' : 'outline'}>
                          {automation.status === 'implemented' ? 'Umgesetzt' : 'Vorgeschlagen'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{automation.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">ROI</div>
                      <div className="text-lg font-bold text-green-600">
                        {(automation.roi_percentage || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Jährliche Einsparung</div>
                      <div className="text-lg font-bold">€{(automation.annual_savings || 0).toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Zeitersparnis</div>
                      <div className="text-lg font-bold">{automation.potential_time_saved_hours}h/Woche</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Komplexität: <span className="font-medium capitalize">{automation.complexity_level}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kosten: €{(automation.implementation_cost || 0).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>ROI-Ranking</CardTitle>
              <CardDescription>Top-Automatisierungsprojekte nach ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="roi" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIFutureProjects;