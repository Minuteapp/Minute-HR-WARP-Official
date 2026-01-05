import { Notification } from "../types";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Calendar, User, AlertCircle } from "lucide-react";

interface TaskDetailProps {
  notification: Notification;
  onAction?: (notificationId: string, actionId: string) => void;
}

export function TaskDetail({ notification, onAction }: TaskDetailProps) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckSquare size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[20px] font-semibold mb-1">
              {notification.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={notification.priority === "high" ? "destructive" : "secondary"}>
                {notification.priority === "high" ? "Hohe Priorität" : "Normale Priorität"}
              </Badge>
              <span className="text-[13px] text-muted-foreground">
                {notification.timestamp.toLocaleString('de-DE')}
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-[14px] text-blue-900">
          {notification.description}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium">Aufgaben-Details</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <User size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Zugewiesen an</p>
              <p className="text-[13px] text-gray-600">Sie</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Fällig am</p>
              <p className="text-[13px] text-gray-600">
                {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">Status</p>
              <p className="text-[13px] text-gray-600">Offen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium">Beschreibung</h3>
        <p className="text-[13px] text-gray-700">
          Bitte überprüfen Sie die Q4 2025 Projektberichte und erstellen Sie eine Zusammenfassung 
          für das Management-Meeting. Achten Sie besonders auf Budget-Abweichungen und Meilenstein-Status.
        </p>
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
