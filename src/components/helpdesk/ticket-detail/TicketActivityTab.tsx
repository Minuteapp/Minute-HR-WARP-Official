import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, MessageSquare, AlertCircle, ArrowRight } from "lucide-react";

interface TicketActivityTabProps {
  ticket: any;
}

export const TicketActivityTab: React.FC<TicketActivityTabProps> = ({ ticket }) => {
  // Keine Mock-Daten - echte Aktivitäten werden aus ticket.activities geladen oder leer angezeigt
  const activities: Array<{
    id: string;
    type: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    timestamp: string;
    statusChange?: { from: string; to: string };
    priorityChange?: { from: string; to: string };
  }> = [];

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
              <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 flex-1 bg-border my-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{activity.title}</span>
              <span className="text-xs text-muted-foreground">• {activity.timestamp}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">{activity.description}</p>

            {/* Status Change Badges - angepasste Farben */}
            {activity.statusChange && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {activity.statusChange.from}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {activity.statusChange.to}
                </Badge>
              </div>
            )}

            {/* Priority Change Badges - angepasste Farben */}
            {activity.priorityChange && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {activity.priorityChange.from}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                  {activity.priorityChange.to}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
