import { Notification } from "../types";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

interface AiBudgetWarningDetailProps {
  notification: Notification;
  onAction?: (notificationId: string, actionId: string) => void;
}

export function AiBudgetWarningDetail({ notification, onAction }: AiBudgetWarningDetailProps) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[20px] font-semibold mb-1">
              {notification.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Hohe Priorität</Badge>
              <span className="text-[13px] text-muted-foreground">
                {notification.timestamp.toLocaleString('de-DE')}
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-orange-900 mb-1">
              Budget-Warnung
            </p>
            <p className="text-[13px] text-orange-800">
              {notification.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[15px] font-medium">Aktueller Budget-Status</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-medium">Verbrauch</span>
              <span className="text-[13px] font-medium">80%</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <p className="text-[12px] text-gray-600">Verbraucht</p>
              <p className="text-[16px] font-semibold">€800</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-600">Verbleibend</p>
              <p className="text-[16px] font-semibold">€200</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium">Prognose</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-blue-900 mb-1">
                Voraussichtlicher Verbrauch
              </p>
              <p className="text-[13px] text-blue-800">
                Bei aktuellem Nutzungstrend wird das Budget in ca. 5 Tagen überschritten
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium">Empfohlene Maßnahmen</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-[13px]">
            <span className="text-primary mt-0.5">•</span>
            <span>Budget für den laufenden Monat anpassen</span>
          </li>
          <li className="flex items-start gap-2 text-[13px]">
            <span className="text-primary mt-0.5">•</span>
            <span>Nutzung bestimmter KI-Modelle einschränken</span>
          </li>
          <li className="flex items-start gap-2 text-[13px]">
            <span className="text-primary mt-0.5">•</span>
            <span>Kosten-Alerts für einzelne Abteilungen einrichten</span>
          </li>
        </ul>
      </div>

      {notification.actions && notification.actions.length > 0 && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          {notification.actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "default"}
              onClick={() => onAction?.(notification.id, action.id)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
