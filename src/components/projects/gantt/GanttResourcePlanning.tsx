
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Clock, Calendar } from "lucide-react";
import { ProjectFormData } from "@/hooks/projects/types";

interface GanttResourcePlanningProps {
  project: ProjectFormData;
}

export const GanttResourcePlanning = ({ project }: GanttResourcePlanningProps) => {
  const mockResources: any[] = [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResources.length}</div>
            <p className="text-xs text-muted-foreground">Aktive Teams</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Auslastung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">Durchschnittlich</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Aufgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mockResources.map((resource) => (
          <Card key={resource.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{resource.name}</h3>
              <Badge variant={resource.allocation > 80 ? "destructive" : resource.allocation > 60 ? "default" : "secondary"}>
                {resource.allocation}% Auslastung
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Team-Mitglieder</p>
                <div className="flex gap-1">
                  {resource.members.map((member, index) => (
                    <Avatar key={index} className="h-6 w-6">
                      <AvatarFallback className="text-xs">{member}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Aufgaben</p>
                <p className="font-medium">{resource.tasks} aktive Aufgaben</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Zeitraum</p>
                <p className="text-sm">{resource.period}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    resource.allocation > 80 ? 'bg-red-500' : 
                    resource.allocation > 60 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${resource.allocation}%` }}
                ></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
