import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Computer, User, UserCog, Clock, AlertCircle } from 'lucide-react';
import { ITSetupItem } from '@/types/onboarding.types';
import { useEnhancedOnboarding } from '@/hooks/useEnhancedOnboarding';

interface ITSetupChecklistProps {
  processId: string;
  items?: ITSetupItem[];
  isLoading: boolean;
  userRole: 'it_department' | 'system_admin' | 'employee' | 'admin' | string;
}

const ITSetupChecklist: React.FC<ITSetupChecklistProps> = ({
  processId,
  items = [],
  isLoading,
  userRole
}) => {
  const { updateITSetupItem, updateGamificationScore } = useEnhancedOnboarding(processId);
  const [filterRole, setFilterRole] = useState<string>('all');
  
  const completeItem = async (item: ITSetupItem) => {
    await updateITSetupItem(item.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    
    // Bei Abschluss eines IT-Setup-Elements Punkte vergeben
    if (userRole === 'employee') {
      updateGamificationScore(processId, 10);
    }
  };

  const startItem = async (item: ITSetupItem) => {
    await updateITSetupItem(item.id, {
      status: 'in_progress'
    });
  };
  
  const sendReminder = async (item: ITSetupItem) => {
    await updateITSetupItem(item.id, {
      reminder_sent_at: new Date().toISOString()
    });
  };
  
  // Items nach Rolle filtern
  const filteredItems = filterRole === 'all' 
    ? items 
    : items.filter(item => item.assignee_role === filterRole);
  
  // Gruppiere Items nach Status
  const pendingItems = filteredItems.filter(item => item.status === 'pending');
  const inProgressItems = filteredItems.filter(item => item.status === 'in_progress');
  const completedItems = filteredItems.filter(item => item.status === 'completed');
  
  // Prüfe, ob eine Erinnerung gesendet werden kann (nicht in den letzten 24 Stunden)
  const canSendReminder = (item: ITSetupItem) => {
    if (!item.reminder_sent_at) return true;
    const lastReminder = new Date(item.reminder_sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'it_department':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">IT-Abteilung</Badge>;
      case 'system_admin':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Systemadministration</Badge>;
      case 'employee':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Mitarbeiter:in</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Ausstehend</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Abgeschlossen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Computer className="h-5 w-5 text-primary" />
            IT-Setup Checkliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Computer className="h-5 w-5 text-primary" />
            IT-Setup Checkliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Computer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine IT-Setup-Elemente gefunden</h3>
            <p className="text-muted-foreground">
              Die IT-Setup-Checkliste wird automatisch basierend auf der Rolle und dem Standort generiert.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Computer className="h-5 w-5 text-primary" />
            IT-Setup Checkliste
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setFilterRole('all')}
                className={filterRole === 'all' ? 'bg-primary text-primary-foreground' : ''}
              >
                Alle
              </TabsTrigger>
              <TabsTrigger 
                value="it_department" 
                onClick={() => setFilterRole('it_department')}
                className={filterRole === 'it_department' ? 'bg-primary text-primary-foreground' : ''}
              >
                <Computer className="h-4 w-4 mr-1" />
                IT
              </TabsTrigger>
              <TabsTrigger 
                value="system_admin" 
                onClick={() => setFilterRole('system_admin')}
                className={filterRole === 'system_admin' ? 'bg-primary text-primary-foreground' : ''}
              >
                <UserCog className="h-4 w-4 mr-1" />
                Admin
              </TabsTrigger>
              <TabsTrigger 
                value="employee" 
                onClick={() => setFilterRole('employee')}
                className={filterRole === 'employee' ? 'bg-primary text-primary-foreground' : ''}
              >
                <User className="h-4 w-4 mr-1" />
                MA
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pendingItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Ausstehend</h3>
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between border p-4 rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium mr-2">{item.title}</h4>
                      {getRoleBadge(item.assignee_role)}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    )}
                    {item.due_date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Fällig bis: {new Date(item.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 ml-4">
                    {(userRole === item.assignee_role || userRole === 'admin') && (
                      <Button size="sm" onClick={() => startItem(item)}>Starten</Button>
                    )}
                    {userRole !== item.assignee_role && canSendReminder(item) && (
                      <Button size="sm" variant="outline" onClick={() => sendReminder(item)}>
                        Erinnern
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {inProgressItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">In Bearbeitung</h3>
              {inProgressItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between border border-yellow-200 bg-yellow-50/30 dark:bg-yellow-900/10 p-4 rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium mr-2">{item.title}</h4>
                      {getRoleBadge(item.assignee_role)}
                      {getStatusBadge(item.status)}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    )}
                    {item.due_date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Fällig bis: {new Date(item.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 ml-4">
                    {(userRole === item.assignee_role || userRole === 'admin') && (
                      <Button size="sm" variant="default" onClick={() => completeItem(item)}>
                        Abschließen
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {completedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Abgeschlossen</h3>
              <div className="border rounded-md divide-y">
                {completedItems.map((item) => (
                  <div key={item.id} className="flex items-center p-3 bg-green-50/30 dark:bg-green-900/10">
                    <Checkbox checked id={`completed-${item.id}`} disabled />
                    <label 
                      htmlFor={`completed-${item.id}`} 
                      className="flex flex-1 items-center ml-3 text-sm font-medium"
                    >
                      {item.title}
                    </label>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(item.assignee_role)}
                      {item.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.completed_at).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {items.some(item => item.status !== 'completed') && 
           items.some(item => item.due_date && new Date(item.due_date) < new Date()) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Überfällige Aufgaben</AlertTitle>
              <AlertDescription>
                Es gibt IT-Setup-Aufgaben, die überfällig sind. Bitte überprüfen Sie die Liste und schließen Sie diese ab.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Fortschritt: {completedItems.length}/{items.length} abgeschlossen
            </div>
            <div className="w-1/3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${(completedItems.length / items.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ITSetupChecklist;
