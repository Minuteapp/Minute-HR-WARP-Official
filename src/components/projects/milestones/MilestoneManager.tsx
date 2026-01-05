import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Edit2,
  Trash2,
  Flag,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
  assignees: string[];
}

interface MilestoneManagerProps {
  projectId: string;
  projectName: string;
}

export const MilestoneManager = ({ projectId, projectName }: MilestoneManagerProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Design Phase Abschluss',
      description: 'Alle UI/UX Designs fertiggestellt und genehmigt',
      dueDate: new Date('2024-02-15'),
      status: 'completed',
      progress: 100,
      priority: 'high',
      dependencies: [],
      assignees: ['Anna Schmidt', 'Lisa Weber'],
      completedDate: new Date('2024-02-12')
    },
    {
      id: '2',
      title: 'Frontend Development',
      description: 'Alle Komponenten und Seiten implementiert',
      dueDate: new Date('2024-03-01'),
      status: 'in-progress',
      progress: 65,
      priority: 'high',
      dependencies: ['1'],
      assignees: ['Max Müller', 'Tom Fischer']
    },
    {
      id: '3',
      title: 'API Integration',
      description: 'Backend-Integration und Datenanbindung',
      dueDate: new Date('2024-03-10'),
      status: 'pending',
      progress: 0,
      priority: 'medium',
      dependencies: ['2'],
      assignees: ['Max Müller']
    },
    {
      id: '4',
      title: 'Testing & QA',
      description: 'Umfassende Tests und Qualitätssicherung',
      dueDate: new Date('2024-03-20'),
      status: 'pending',
      progress: 0,
      priority: 'high',
      dependencies: ['3'],
      assignees: ['Lisa Weber', 'Anna Schmidt']
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const
  });

  const getStatusColor = (status: Milestone['status']) => {
    const colors = {
      pending: 'bg-gray-500',
      'in-progress': 'bg-blue-500',
      completed: 'bg-green-500',
      overdue: 'bg-red-500'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Milestone['status']) => {
    const labels = {
      pending: 'Wartend',
      'in-progress': 'In Bearbeitung',
      completed: 'Abgeschlossen',
      overdue: 'Überfällig'
    };
    return labels[status];
  };

  const getPriorityIcon = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'low':
        return <Flag className="h-4 w-4 text-green-500" />;
    }
  };

  const isOverdue = (milestone: Milestone) => {
    return milestone.status !== 'completed' && new Date() > milestone.dueDate;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const completeMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === id 
        ? { ...m, status: 'completed' as const, progress: 100, completedDate: new Date() }
        : m
    ));
    toast.success('Meilenstein als abgeschlossen markiert');
  };

  const updateProgress = (id: string, progress: number) => {
    setMilestones(prev => prev.map(m => 
      m.id === id 
        ? { 
            ...m, 
            progress, 
            status: progress === 100 ? 'completed' as const : 
                   progress > 0 ? 'in-progress' as const : 'pending' as const,
            completedDate: progress === 100 ? new Date() : undefined
          }
        : m
    ));
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.dueDate) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      dueDate: new Date(newMilestone.dueDate),
      status: 'pending',
      progress: 0,
      priority: newMilestone.priority,
      dependencies: [],
      assignees: []
    };

    setMilestones(prev => [...prev, milestone]);
    setNewMilestone({ title: '', description: '', dueDate: '', priority: 'medium' });
    setShowAddDialog(false);
    toast.success('Meilenstein erfolgreich erstellt');
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    toast.success('Meilenstein gelöscht');
  };

  const overallProgress = milestones.length > 0 
    ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length 
    : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meilensteine - {projectName}
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Meilenstein
          </Button>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Gesamtfortschritt</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Milestone Timeline */}
        <div className="space-y-4">
          <AnimatePresence>
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Line */}
                {index < milestones.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Timeline Node */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full border-4 border-background flex items-center justify-center ${getStatusColor(milestone.status)}`}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                    {isOverdue(milestone) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Milestone Content */}
                  <div className="flex-1">
                    <Card className={`border ${isOverdue(milestone) ? 'border-red-200 bg-red-50/50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{milestone.title}</h4>
                                {getPriorityIcon(milestone.priority)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getStatusColor(milestone.status) + ' text-white border-transparent'}>
                                {getStatusLabel(milestone.status)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMilestone(milestone.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress */}
                          {milestone.status !== 'completed' && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span>Fortschritt</span>
                                <span>{milestone.progress}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={milestone.progress} className="flex-1 h-2" />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateProgress(milestone.id, Math.min(100, milestone.progress + 25))}
                                  disabled={milestone.progress >= 100}
                                >
                                  +25%
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {milestone.status === 'completed' && milestone.completedDate
                                    ? `Abgeschlossen: ${milestone.completedDate.toLocaleDateString()}`
                                    : `Fällig: ${milestone.dueDate.toLocaleDateString()}`}
                                </span>
                              </div>
                              {milestone.status !== 'completed' && (
                                <span className={`${isOverdue(milestone) ? 'text-red-500 font-medium' : ''}`}>
                                  {getDaysUntilDue(milestone.dueDate) >= 0 
                                    ? `${getDaysUntilDue(milestone.dueDate)} Tage`
                                    : `${Math.abs(getDaysUntilDue(milestone.dueDate))} Tage überfällig`}
                                </span>
                              )}
                            </div>
                            
                            {milestone.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => completeMilestone(milestone.id)}
                                className="gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Abschließen
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Milestone Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer Meilenstein</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titel</label>
                <Input
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Meilenstein-Titel"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Beschreibung</label>
                <Textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung des Meilensteins"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Fälligkeitsdatum</label>
                <Input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button onClick={addMilestone} className="flex-1">
                  Erstellen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};