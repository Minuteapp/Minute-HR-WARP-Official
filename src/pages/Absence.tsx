import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Users, BarChart3, Clock, Info } from 'lucide-react';
import { AbsenceRequestForm } from '@/components/absence/AbsenceRequestForm';
import { AbsenceList } from '@/components/absence/AbsenceList';
import { TeamAbsenceOverview } from '@/components/absence/TeamAbsenceOverview';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useEffectiveSettings } from '@/hooks/useEffectiveSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Absence = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const { hasPermission } = useRolePermissions();
  
  // Settings-Driven Architecture: Lade Abwesenheits-Einstellungen
  const { isAllowed, loading: settingsLoading, getRestrictionReason } = useEffectiveSettings('absence');
  
  // Prüfe ob Selbst-Anträge erlaubt sind
  const canRequestAbsence = isAllowed('self_request_allowed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Abwesenheitsverwaltung</h1>
            <p className="text-slate-600 mt-1">
              Verwalten Sie Urlaubsanträge, Krankmeldungen und andere Abwesenheiten
            </p>
          </div>
          {canRequestAbsence ? (
            <Button onClick={() => setShowNewRequest(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Neue Abwesenheit
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Button disabled className="gap-2 opacity-50 cursor-not-allowed">
                      <Plus className="h-4 w-4" />
                      Neue Abwesenheit
                    </Button>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{getRestrictionReason('self_request_allowed') || 'Funktion nicht verfügbar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Offene Anträge</p>
                  <p className="text-2xl font-bold text-slate-800">5</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Heute abwesend</p>
                  <p className="text-2xl font-bold text-slate-800">12</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Diese Woche</p>
                  <p className="text-2xl font-bold text-slate-800">28</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Gesamt (Monat)</p>
                  <p className="text-2xl font-bold text-slate-800">142</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">Anträge</TabsTrigger>
            <TabsTrigger value="team">Team-Übersicht</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <AbsenceList />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamAbsenceOverview />
          </TabsContent>
        </Tabs>

        {/* New Request Dialog */}
        {showNewRequest && (
          <AbsenceRequestForm 
            open={showNewRequest}
            onOpenChange={setShowNewRequest}
          />
        )}
      </div>
    </div>
  );
};

export default Absence;