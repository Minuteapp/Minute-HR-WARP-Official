
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Lightbulb, 
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';
import SmartSchedulingDialog from './SmartSchedulingDialog';
import ProjectTimeBlockDialog from './ProjectTimeBlockDialog';
import MeetingRoomSuggestions from './MeetingRoomSuggestions';
import FollowUpTasksCard from './FollowUpTasksCard';
import { mockMeetingRooms, mockFollowUpTasks } from '@/services/smartCalendarService';

export const SmartCalendarFeatures = () => {
  const [showSmartScheduling, setShowSmartScheduling] = useState(false);
  const [showProjectTimeBlock, setShowProjectTimeBlock] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Smart Calendar Features</h2>
        <Badge variant="outline" className="ml-auto">
          KI-Unterstützt
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setShowSmartScheduling(true)}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Smart-Terminvorschläge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Lassen Sie die KI optimale Terminzeiten basierend auf Verfügbarkeiten vorschlagen.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Vorschlag generieren
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowProjectTimeBlock(true)}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-500" />
              Projekt-Zeitblöcke
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Erstellen Sie fokussierte Arbeitsblöcke für Ihre Projekte.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Zeitblock erstellen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Smart Features Tabs */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Vorschläge
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Konflikte
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Räume
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Follow-ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Intelligente Terminvorschläge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Keine aktiven Vorschläge</p>
                <p className="text-sm mb-4">
                  Klicken Sie auf "Smart-Terminvorschläge", um KI-basierte Terminvorschläge zu erhalten.
                </p>
                <Button onClick={() => setShowSmartScheduling(true)}>
                  Vorschlag generieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Terminkonflikte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Keine Konflikte erkannt</p>
                <p className="text-sm">
                  Das System überwacht automatisch Ihre Termine auf Überschneidungen.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Meeting-Raum Vorschläge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MeetingRoomSuggestions rooms={mockMeetingRooms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Follow-up Aufgaben
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FollowUpTasksCard tasks={mockFollowUpTasks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Smart-Vorschläge</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Konflikte vermieden</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Effizienzsteigerung</p>
                <p className="text-2xl font-bold">24%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <SmartSchedulingDialog 
        open={showSmartScheduling} 
        onOpenChange={setShowSmartScheduling} 
      />
      
      <ProjectTimeBlockDialog 
        open={showProjectTimeBlock} 
        onOpenChange={setShowProjectTimeBlock} 
      />
    </div>
  );
};
