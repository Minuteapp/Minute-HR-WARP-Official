import { Notification } from "../types";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Tag } from "lucide-react";

interface DefaultNotificationDetailProps {
  notification: Notification;
  onAction?: (notificationId: string, actionId: string) => void;
}

export function DefaultNotificationDetail({ notification, onAction }: DefaultNotificationDetailProps) {
  const getPriorityBadge = () => {
    switch (notification.priority) {
      case "critical":
        return <Badge variant="destructive">Kritisch</Badge>;
      case "high":
        return <Badge variant="destructive">Hoch</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "low":
        return <Badge variant="outline">Niedrig</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[20px] font-semibold mb-1">
              {notification.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getPriorityBadge()}
              <span className="text-[13px] text-muted-foreground">
                {notification.timestamp.toLocaleString('de-DE')}
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-[14px] text-gray-900">
          {notification.description}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium">Details</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Zeitpunkt</p>
              <p className="text-[13px] text-gray-600">
                {notification.timestamp.toLocaleString('de-DE')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Quelle</p>
              <p className="text-[13px] text-gray-600">{notification.source}</p>
            </div>
          </div>

          {notification.relatedModule && (
            <div className="flex items-start gap-3">
              <Bell size={18} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-gray-900">Modul</p>
                <p className="text-[13px] text-gray-600">{notification.relatedModule}</p>
              </div>
            </div>
          )}
        </div>
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
