
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, Paperclip, Trash2, Eye } from "lucide-react";

interface TaskAttachmentsProps {
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment?: (id: string) => void;
  onViewAttachment?: (url: string) => void;
}

export const TaskAttachments = ({
  attachments = [],
  onFileChange,
  onRemoveAttachment,
  onViewAttachment,
}: TaskAttachmentsProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1">
        <Paperclip className="h-4 w-4 text-[#9b87f5]" />
        Anhänge
      </h3>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileChange}
          multiple
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClickUpload}
          className="w-full"
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Datei anhängen
        </Button>

        {attachments.length > 0 && (
          <ScrollArea className="h-36 rounded-md border">
            <div className="p-2 space-y-2">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {onViewAttachment && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onViewAttachment(file.url)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onRemoveAttachment && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => onRemoveAttachment(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
