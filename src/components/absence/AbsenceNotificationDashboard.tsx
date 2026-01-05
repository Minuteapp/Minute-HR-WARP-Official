
import React from 'react';
import { AbsenceAutoNotificationsList } from './AbsenceAutoNotificationsList';
import { AbsenceNotificationSettings } from './AbsenceNotificationSettings';
import { AbsenceNotifications } from './AbsenceNotifications';
import { AbsenceGeneralSettings } from './settings/AbsenceGeneralSettings';
import { AbsenceTypeManagement } from './settings/AbsenceTypeManagement';
import { AbsenceHolidayManagement } from './settings/AbsenceHolidayManagement';
import { AbsenceBlackoutPeriods } from './settings/AbsenceBlackoutPeriods';
import { AbsenceQuotaManagement } from './settings/AbsenceQuotaManagement';
import { AbsenceSubstituteRules } from './settings/AbsenceSubstituteRules';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, List, Sliders, Palette, CalendarDays, Ban, Calendar, UserCheck } from 'lucide-react';

export const AbsenceNotificationDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Abwesenheits-Verwaltung</h2>
        <p className="text-muted-foreground">
          Verwalten Sie alle Einstellungen für Abwesenheiten, Benachrichtigungen und Feiertage
        </p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <div className="space-y-2">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Benachrichtigungen</span>
            </TabsTrigger>
            <TabsTrigger value="automatic" className="flex items-center gap-2 py-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Auto-Benachrichtigungen</span>
            </TabsTrigger>
            <TabsTrigger value="notification-settings" className="flex items-center gap-2 py-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Benachrichtigungs-Settings</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2 py-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Allgemein</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2 py-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Typen</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="holidays" className="flex items-center gap-2 py-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Feiertage</span>
            </TabsTrigger>
            <TabsTrigger value="blackout" className="flex items-center gap-2 py-2">
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Sperrperioden</span>
            </TabsTrigger>
            <TabsTrigger value="quotas" className="flex items-center gap-2 py-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Kontingente</span>
            </TabsTrigger>
            <TabsTrigger value="substitutes" className="flex items-center gap-2 py-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Vertretungen</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notifications" className="space-y-4">
          <AbsenceNotifications />
        </TabsContent>

        <TabsContent value="automatic" className="space-y-4">
          <AbsenceAutoNotificationsList />
        </TabsContent>

        <TabsContent value="notification-settings" className="space-y-4">
          <AbsenceNotificationSettings />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <AbsenceGeneralSettings />
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <AbsenceTypeManagement />
        </TabsContent>

        <TabsContent value="holidays" className="space-y-4">
          <AbsenceHolidayManagement />
        </TabsContent>

        <TabsContent value="blackout" className="space-y-4">
          <AbsenceBlackoutPeriods />
        </TabsContent>

        <TabsContent value="quotas" className="space-y-4">
          <AbsenceQuotaManagement />
        </TabsContent>

        <TabsContent value="substitutes" className="space-y-4">
          <AbsenceSubstituteRules />
        </TabsContent>
      </Tabs>
    </div>
  );
};
