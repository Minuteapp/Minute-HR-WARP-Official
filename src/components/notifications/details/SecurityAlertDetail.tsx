import { Notification } from "../types";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Clock, AlertTriangle } from "lucide-react";

interface SecurityAlertDetailProps {
  notification: Notification;
  onAction?: (notificationId: string, actionId: string) => void;
}

export function SecurityAlertDetail({ notification, onAction }: SecurityAlertDetailProps) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[20px] font-semibold mb-1">
              {notification.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Kritisch</Badge>
              <span className="text-[13px] text-muted-foreground">
                {notification.timestamp.toLocaleString('de-DE')}
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-red-900 mb-1">
              Sicherheitswarnung
            </p>
            <p className="text-[13px] text-red-800">
              {notification.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium">Details</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Standort</p>
              <p className="text-[13px] text-gray-600">Berlin, Deutschland</p>
              <p className="text-[12px] text-gray-500">IP: 192.168.1.100</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Zeitpunkt</p>
              <p className="text-[13px] text-gray-600">
                {notification.timestamp.toLocaleString('de-DE')}
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
            <span>Überprüfen Sie, ob Sie den Login-Versuch selbst durchgeführt haben</span>
          </li>
          <li className="flex items-start gap-2 text-[13px]">
            <span className="text-primary mt-0.5">•</span>
            <span>Ändern Sie Ihr Passwort, falls Sie den Zugriff nicht erkennen</span>
          </li>
          <li className="flex items-start gap-2 text-[13px]">
            <span className="text-primary mt-0.5">•</span>
            <span>Aktivieren Sie die Zwei-Faktor-Authentifizierung</span>
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
