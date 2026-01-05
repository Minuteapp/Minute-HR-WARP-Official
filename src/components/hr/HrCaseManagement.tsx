import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useHrCases, useCreateHrCase, useUpdateHrCase } from '@/hooks/useHrCases';
import { HrCaseFormData, CASE_PRIORITY_OPTIONS, CASE_STATUS_OPTIONS, CASE_CATEGORY_OPTIONS } from '@/types/sprint1.types';

const HrCaseManagement = () => {
  const { data: cases, isLoading } = useHrCases();
  const createCase = useCreateHrCase();
  const updateCase = useUpdateHrCase();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const caseForm = useForm<HrCaseFormData>();

  const onCreateCase = (data: HrCaseFormData) => {
    createCase.mutate(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
        caseForm.reset();
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    const option = CASE_PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const option = CASE_STATUS_OPTIONS.find(s => s.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <FileText className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const filteredCases = cases?.filter(hrCase => {
    const matchesSearch = hrCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hrCase.case_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || hrCase.status === activeTab;
    
    return matchesSearch && matchesTab;
  }) || [];

  const stats = {
    total: cases?.length || 0,
    open: cases?.filter(c => c.status === 'open').length || 0,
    in_progress: cases?.filter(c => c.status === 'in_progress').length || 0,
    overdue: cases?.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'closed').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Lade HR-Fälle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HR Case Management</h2>
          <p className="text-muted-foreground">
            {stats.total} Fälle • {stats.open} offen • {stats.overdue} überfällig
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Fall
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen HR-Fall erstellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={caseForm.handleSubmit(onCreateCase)} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  {...caseForm.register('title', { required: true })}
                  placeholder="z.B. Beschwerdemanagement Kunde XY"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Select onValueChange={(value) => caseForm.setValue('category', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priorität</Label>
                  <Select onValueChange={(value) => caseForm.setValue('priority', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priorität wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_PRIORITY_OPTIONS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due_date">Fälligkeitsdatum</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...caseForm.register('due_date')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  {...caseForm.register('description')}
                  placeholder="Detaillierte Beschreibung des Falls"
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_confidential"
                  {...caseForm.register('is_confidential')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_confidential">Vertraulich</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createCase.isPending}>
                  {createCase.isPending ? 'Erstelle...' : 'Fall erstellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Offen</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Bearbeitung</p>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Überfällig</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Titel oder Fall-Nummer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Cases List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="open">Offen</TabsTrigger>
          <TabsTrigger value="in_progress">In Bearbeitung</TabsTrigger>
          <TabsTrigger value="resolved">Gelöst</TabsTrigger>
          <TabsTrigger value="closed">Geschlossen</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredCases.length > 0 ? (
            filteredCases.map((hrCase) => (
              <Card key={hrCase.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(hrCase.status)}
                        <h3 className="font-semibold text-lg">{hrCase.title}</h3>
                        <Badge className={getPriorityColor(hrCase.priority)}>
                          {CASE_PRIORITY_OPTIONS.find(p => p.value === hrCase.priority)?.label}
                        </Badge>
                        <Badge className={getStatusColor(hrCase.status)}>
                          {CASE_STATUS_OPTIONS.find(s => s.value === hrCase.status)?.label}
                        </Badge>
                        {hrCase.is_confidential && (
                          <Badge variant="destructive">Vertraulich</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{hrCase.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>#{hrCase.case_number}</span>
                        <span>Kategorie: {CASE_CATEGORY_OPTIONS.find(c => c.value === hrCase.category)?.label}</span>
                        {hrCase.due_date && (
                          <span className={new Date(hrCase.due_date) < new Date() ? 'text-red-600' : ''}>
                            Fällig: {format(new Date(hrCase.due_date), 'dd.MM.yyyy', { locale: de })}
                          </span>
                        )}
                        <span>
                          Erstellt: {format(new Date(hrCase.created_at), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {hrCase.timeline && hrCase.timeline.length > 0 && (
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {hrCase.timeline.length}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Öffnen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Fälle gefunden</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm ? 'Keine Fälle entsprechen Ihrer Suche.' : 'Noch keine HR-Fälle vorhanden.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ersten Fall erstellen
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrCaseManagement;