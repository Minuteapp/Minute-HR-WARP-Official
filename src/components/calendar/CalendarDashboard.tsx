import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Users, Building2, Repeat, BarChart3, History } from 'lucide-react';
import CalendarOverview from './tabs/CalendarOverview';
import CalendarMonthView from './tabs/CalendarMonthView';
import CalendarWeekView from './tabs/CalendarWeekView';
import CalendarDayView from './tabs/CalendarDayView';
import CalendarTeamView from './tabs/CalendarTeamView';
import CalendarCompanyEvents from './tabs/CalendarCompanyEvents';
import CalendarResources from './tabs/CalendarResources';
import CalendarSync from './tabs/CalendarSync';
import CalendarReports from './tabs/CalendarReports';
import CalendarHistory from './tabs/CalendarHistory';

const CalendarDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kalender</h1>
          <p className="text-muted-foreground">Zentrale Drehscheibe für alle Termine und Events</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-10 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="month">Monat</TabsTrigger>
          <TabsTrigger value="week">Woche</TabsTrigger>
          <TabsTrigger value="day" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tag
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Unternehmen
          </TabsTrigger>
          <TabsTrigger value="resources">Ressourcen</TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Sync
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Berichte
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CalendarOverview />
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <CalendarMonthView />
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          <CalendarWeekView />
        </TabsContent>

        <TabsContent value="day" className="mt-6">
          <CalendarDayView />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <CalendarTeamView />
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <CalendarCompanyEvents />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <CalendarResources />
        </TabsContent>

        <TabsContent value="sync" className="mt-6">
          <CalendarSync />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <CalendarReports />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CalendarHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarDashboard;