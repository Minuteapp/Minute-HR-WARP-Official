import React from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileIcon, Upload, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TaskAttachmentsTabProps {
  task: Task;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export const TaskAttachmentsTab = ({ task, handleFileChange, readOnly = false }: TaskAttachmentsTabProps) => {
  const attachments = Array.isArray(task.attachments) ? task.attachments : [];

  return (
    <div className="p-6">
      {/* Header mit Icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Paperclip className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <p className="text-sm text-gray-600">Anhänge und Dateien</p>
        </div>
      </div>

      {/* Attachments Liste */}
      <div className="space-y-4">
        {attachments.length > 0 ? (
          <div className="grid gap-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{attachment.name}</div>
                  <div className="text-xs text-gray-500">
                    {attachment.uploadedAt && 
                      format(new Date(attachment.uploadedAt), 'dd.MM.yyyy, HH:mm', { locale: de })
                    }
                    {attachment.size && ` • ${Math.round(attachment.size / 1024)} KB`}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Herunterladen
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Keine Anhänge verfügbar</h3>
            <p className="text-gray-600 mb-4">
              Für diese Aufgabe wurden noch keine Dateien hochgeladen.
            </p>
          </div>
        )}
      </div>

      {/* Upload Area */}
      {!readOnly && (
        <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium mb-2">Dateien hier ablegen oder</h3>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>Dateien auswählen</span>
            </Button>
          </Label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          />
          <p className="text-xs text-gray-500 mt-2">
            Unterstützt: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (max. 10MB)
          </p>
        </div>
      )}

      {/* Demo Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-yellow-600 font-medium text-sm">Demo:</div>
          <div className="text-yellow-700 text-sm">
            Anhänge sind nur für die erste Aufgabe verfügbar. In der vollständigen Version können Sie Dateien für alle Aufgaben hochladen und verwalten.
          </div>
        </div>
      </div>
    </div>
  );
};