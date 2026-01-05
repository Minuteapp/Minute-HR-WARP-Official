import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import { TeamVacationPlanner } from '@/components/absence/TeamVacationPlanner';

interface TeamCalendarContentProps {
  currentDate: Date;
  view: 'month' | 'week' | 'year' | 'day';
}

const TeamCalendarContent: React.FC<TeamCalendarContentProps> = ({ currentDate, view }) => {
  return (
    <div className="h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team-Kalender
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <Tabs defaultValue="planner" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="planner">Urlaubsplaner</TabsTrigger>
              <TabsTrigger value="overview">Team-Übersicht</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="planner" className="flex-1 mt-6">
              <TeamVacationPlanner />
            </TabsContent>
            
            <TabsContent value="overview" className="flex-1 mt-6">
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Team-Übersicht</h3>
                  <p className="text-muted-foreground">
                    Zeigt alle Team-Termine und Abwesenheiten in einer gemeinsamen Ansicht
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="flex-1 mt-6">
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Team Analytics</h3>
                  <p className="text-muted-foreground">
                    Statistiken zu Abwesenheiten, Arbeitszeiten und Team-Auslastung
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCalendarContent;