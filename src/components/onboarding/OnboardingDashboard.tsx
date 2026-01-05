import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, FileCheck, GraduationCap, CalendarDays, Upload, Plus, Filter, LayoutGrid, FileText, ClipboardList, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnboardingProcessCard from './OnboardingProcessCard';
import { NewEmployeeForm } from './NewEmployeeForm';
import { useOnboardingProcess } from '@/hooks/useOnboardingProcess';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const OnboardingDashboard = () => {
  const navigate = useNavigate();
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    onboardingProcesses, 
    loadingProcesses, 
    filtering, 
    setFiltering 
  } = useOnboardingProcess();

  const filteredProcesses = onboardingProcesses?.filter(process => {
    const employeeName = process.employee?.name || 
      `${process.employee?.first_name || ''} ${process.employee?.last_name || ''}`;
    
    const departmentMatch = process.employee?.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatch || departmentMatch;
  });

  // Calculate statistics
  const stats = {
    total: onboardingProcesses?.length || 0,
    inProgress: onboardingProcesses?.filter(p => p.status === 'in_progress').length || 0,
    completed: onboardingProcesses?.filter(p => p.status === 'completed').length || 0,
    notStarted: onboardingProcesses?.filter(p => p.status === 'not_started').length || 0,
    upcomingStart: onboardingProcesses?.filter(p => {
      if (!p.start_date) return false;
      const startDate = new Date(p.start_date);
      const now = new Date();
      const inSevenDays = new Date();
      inSevenDays.setDate(now.getDate() + 7);
      return p.status === 'not_started' && startDate >= now && startDate <= inSevenDays;
    }).length || 0
  };

  const statCards = [
    {
      title: "Aktive Onboardings",
      value: stats.inProgress,
      icon: UserPlus,
      color: "text-blue-500",
      onClick: () => {
        setFiltering(prev => ({ ...prev, status: 'in_progress' }));
      }
    },
    {
      title: "Abgeschlossen",
      value: stats.completed,
      icon: FileCheck,
      color: "text-green-500",
      onClick: () => {
        setFiltering(prev => ({ ...prev, status: 'completed' }));
      }
    },
    {
      title: "Nicht gestartet",
      value: stats.notStarted,
      icon: CalendarDays,
      color: "text-orange-500",
      onClick: () => {
        setFiltering(prev => ({ ...prev, status: 'not_started' }));
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Onboarding</h1>
              <p className="text-sm text-muted-foreground">Mitarbeiter einarbeiten und begleiten</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/onboarding/documents')} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Dokument hochladen
            </Button>
            <Button onClick={() => setShowNewEmployeeForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Onboarding
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="processes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
              Prozesse
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
              Vorlagen
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
              Aufgaben
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
              Berichte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Processes Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Onboarding-Prozesse
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="flex gap-2 w-full md:w-auto">
                  <Select 
                    value={filtering.status} 
                    onValueChange={(value) => setFiltering(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="not_started">Nicht gestartet</SelectItem>
                      <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-[200px]"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setFiltering({ status: 'all', department: 'all' });
                    setSearchQuery('');
                  }}
                  title="Filter zurücksetzen"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loadingProcesses ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredProcesses?.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium mb-2">Keine Onboarding-Prozesse gefunden</h3>
                  <p className="text-muted-foreground mb-4">Erstellen Sie einen neuen Onboarding-Prozess, um zu beginnen.</p>
                  <Button onClick={() => setShowNewEmployeeForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Neues Onboarding
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProcesses?.map((process) => (
                    <OnboardingProcessCard key={process.id} process={process} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

          </TabsContent>

          <TabsContent value="processes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding-Prozesse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Prozessverwaltung wird hier angezeigt.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vorlagen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Onboarding-Vorlagen werden hier angezeigt.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Onboarding-Aufgaben werden hier angezeigt.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Berichte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Onboarding-Berichte werden hier angezeigt.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showNewEmployeeForm} onOpenChange={setShowNewEmployeeForm}>
          <DialogContent className="sm:max-w-[800px]">
            <NewEmployeeForm onCancel={() => setShowNewEmployeeForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OnboardingDashboard;