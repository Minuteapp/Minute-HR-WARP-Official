import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, X, Check } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Document } from '@/types/documents';

interface DocumentApprovalManagerProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApprovalWorkflow {
  id: string;
  workflow_name: string;
  steps: ApprovalStep[];
  current_step: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

interface ApprovalStep {
  step_number: number;
  approver_id: string;
  approver_email: string;
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  comments?: string;
}

export const DocumentApprovalManager: React.FC<DocumentApprovalManagerProps> = ({
  document,
  open,
  onOpenChange
}) => {
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [comments, setComments] = useState('');
  const queryClient = useQueryClient();

  // Hole verfügbare Benutzer für Genehmigungen
  const { data: availableUsers } = useQuery({
    queryKey: ['approval-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role
        `)
        .in('role', ['admin', 'superadmin', 'hr']);

      if (error) throw error;
      return data;
    }
  });


  // Hole Benutzerprofile für die Anzeige
  const { data: userProfiles } = useQuery({
    queryKey: ['user-profiles', availableUsers?.map(u => u.user_id)],
    queryFn: async () => {
      if (!availableUsers || availableUsers.length === 0) return [];
      const userIds = availableUsers.map(u => u.user_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);
      if (error) throw error;
      return data;
    },
    enabled: !!availableUsers && availableUsers.length > 0
  });

  // Hole aktuelle Genehmigungsworkflows für das Dokument
  const { data: workflows } = useQuery({
    queryKey: ['document-workflows', document.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_approvals')
        .select('*')
        .eq('document_id', document.id)
        .order('step_order', { ascending: true });
      
      if (error) throw error;
      
      // Gruppiere nach workflow_name
      const workflowMap = new Map<string, ApprovalWorkflow>();
      for (const approval of data || []) {
        const workflowName = (approval as any).workflow_name || 'Standard';
        if (!workflowMap.has(workflowName)) {
          workflowMap.set(workflowName, {
            id: approval.id,
            workflow_name: workflowName,
            steps: [],
            current_step: 1,
            status: 'pending'
          });
        }
        const workflow = workflowMap.get(workflowName)!;
        const profile = userProfiles?.find(p => p.id === approval.approver_id);
        workflow.steps.push({
          step_number: (approval as any).step_order || workflow.steps.length + 1,
          approver_id: approval.approver_id,
          approver_email: profile?.email || `user-${approval.approver_id.slice(0, 8)}`,
          approver_name: profile?.full_name,
          status: approval.status as 'pending' | 'approved' | 'rejected',
          approved_at: approval.approved_at || undefined,
          comments: approval.comments || undefined
        });
        
        // Update workflow status
        if (approval.status === 'rejected') workflow.status = 'rejected';
        else if (approval.status === 'approved' && workflow.status !== 'rejected') {
          const allApproved = workflow.steps.every(s => s.status === 'approved');
          if (allApproved) workflow.status = 'approved';
        }
      }
      
      return Array.from(workflowMap.values());
    },
    enabled: open
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflowData: {
      document_id: string;
      workflow_name: string;
      approvers: string[];
      deadline?: string;
      comments?: string;
    }) => {
      // Importiere den documentService dynamisch um circular dependencies zu vermeiden
      const { documentService } = await import('@/services/documentService');
      
      // Nutze die neue submitForApproval Funktion
      const document = await documentService.submitForApproval(
        workflowData.document_id,
        workflowData.approvers,
        workflowData.workflow_name,
        workflowData.deadline,
        workflowData.comments
      );

      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-workflows', document.id] });
      queryClient.invalidateQueries({ queryKey: ['document-approvals'] });
      toast.success('Genehmigungsworkflow erstellt und Benachrichtigungen gesendet');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to create workflow:', error);
      toast.error('Fehler beim Erstellen des Workflows');
    }
  });

  // Helper: Finde Profil für User
  const getProfileForUser = (userId: string) => {
    return userProfiles?.find(p => p.id === userId);
  };

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      toast.error('Bitte geben Sie einen Workflow-Namen ein');
      return;
    }

    if (selectedApprovers.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Genehmiger aus');
      return;
    }

    createWorkflow.mutate({
      document_id: document.id,
      workflow_name: workflowName,
      approvers: selectedApprovers,
      deadline,
      comments
    });
  };

  const handleApproverToggle = (userId: string) => {
    setSelectedApprovers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Genehmigungsmanagement</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dokument Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokument</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{document.title}</h3>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={document.status === 'pending' ? 'secondary' : 'default'}>
                      {document.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Erstellt: {new Date(document.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
                <Badge variant={document.requires_approval ? 'default' : 'secondary'}>
                  {document.requires_approval ? 'Genehmigung erforderlich' : 'Keine Genehmigung erforderlich'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Aktueller Workflow Status */}
          {workflows && workflows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktive Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{workflow.workflow_name}</h4>
                        <Badge variant={
                          workflow.status === 'approved' ? 'default' :
                          workflow.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {workflow.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {workflow.steps.map((step) => (
                          <div key={step.step_number} className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              step.status === 'approved' ? 'bg-green-500 text-white' :
                              step.status === 'rejected' ? 'bg-red-500 text-white' :
                              workflow.current_step === step.step_number ? 'bg-blue-500 text-white' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {step.status === 'approved' ? '✓' : 
                               step.status === 'rejected' ? '✗' : step.step_number}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {step.approver_name || step.approver_email}
                              </p>
                              {step.approver_name && (
                                <p className="text-xs text-muted-foreground">{step.approver_email}</p>
                              )}
                              {step.comments && (
                                <p className="text-xs text-muted-foreground italic mt-1">"{step.comments}"</p>
                              )}
                            </div>
                            {step.approved_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(step.approved_at).toLocaleDateString('de-DE')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Neuen Workflow erstellen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Neuen Genehmigungsworkflow erstellen</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="z.B. Standard Dokumentengenehmigung"
                />
              </div>

              <div>
                <Label>Genehmiger auswählen</Label>
                <div className="mt-2 space-y-2">
                  {availableUsers?.map((user) => {
                    const profile = getProfileForUser(user.user_id);
                    return (
                      <div key={user.user_id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedApprovers.includes(user.user_id)}
                          onChange={() => handleApproverToggle(user.user_id)}
                          className="rounded"
                        />
                        <Avatar className="h-8 w-8">
                          {profile?.avatar_url && (
                            <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                          )}
                          <AvatarFallback>
                            {profile?.full_name?.slice(0, 2).toUpperCase() || user.user_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{profile?.full_name || `Benutzer ${user.user_id.slice(0, 8)}`}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile?.email || 'Keine E-Mail'} • Rolle: {user.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Genehmigungsfrist (optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="comments">Kommentare (optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Zusätzliche Informationen für die Genehmiger..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleCreateWorkflow}
                  disabled={createWorkflow.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {createWorkflow.isPending ? 'Wird erstellt...' : 'Workflow erstellen'}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};