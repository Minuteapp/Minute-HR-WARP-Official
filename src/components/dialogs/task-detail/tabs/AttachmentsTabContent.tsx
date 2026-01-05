
import React from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Paperclip, FileText, Download, X } from "lucide-react";

interface AttachmentsTabContentProps {
  task: Task;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export const AttachmentsTabContent = ({ task, onFileChange, readOnly = false }: AttachmentsTabContentProps) => {
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputFileRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="mb-4">
          <input
            type="file"
            ref={inputFileRef}
            onChange={onFileChange}
            className="hidden"
            multiple
          />
          <Button
            variant="outline"
            onClick={handleClick}
            className="w-full flex items-center justify-center"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Dateien hochladen
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {task.attachments && task.attachments.length > 0 ? (
          task.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="font-medium">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {(attachment.size &&
                      Math.round(attachment.size / 1024) + ' KB') ||
                      ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                {!readOnly && (
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Keine Anhänge vorhanden
          </div>
        )}
      </div>
    </div>
  );
};
