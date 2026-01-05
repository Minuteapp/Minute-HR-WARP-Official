import React from "react";
import { Task } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, TrendingUp, AlertTriangle } from "lucide-react";

interface TaskDetailsTabProps {
  task: Task;
  onTaskUpdate: (updates: Partial<Task>) => void;
  readOnly?: boolean;
}

export const TaskDetailsTab = ({ task, onTaskUpdate, readOnly = false }: TaskDetailsTabProps) => {
  return (
    <div className="p-6 space-y-6">
      {/* Kontext */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">Kontext</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {/* Roadmap */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Marketing 2025</div>
                <div className="text-xs text-gray-500">Q1-Q4 2025</div>
              </div>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Roadmap
            </Badge>
          </div>

          {/* Projekt */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Kampagne Social Media</div>
                <div className="text-xs text-gray-500">Neue Social Media Strategie implementieren</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">65% abgeschlossen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risikobewertung */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium">Risikobewertung</h3>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Risiko-Level</div>
            <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
              MEDIUM
            </Badge>
          </div>
        </div>
      </div>

      {/* Fortschritt */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium">Fortschritt</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600">Geplante Zeit</div>
              <div className="text-lg font-semibold">24h</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Erfasste Zeit</div>
              <div className="text-lg font-semibold">0h</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-600">Zeitfortschritt</div>
              <div className="text-sm text-gray-500">0%</div>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      </div>

      {/* KI-Einblicke */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <h3 className="text-lg font-medium">KI-Einblicke</h3>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Auswirkung auf Projekt</div>
            <div className="text-sm text-gray-700">
              Hohe Auswirkung - Schlüssel-Deliverable für Q1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};