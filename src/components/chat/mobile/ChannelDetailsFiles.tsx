import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Image } from "lucide-react";
import { useState } from "react";

interface File {
  id: string;
  name: string;
  size: string;
  date: string;
  uploader: string;
  type: "document" | "image";
}

export default function ChannelDetailsFiles() {
  const [fileType, setFileType] = useState<"documents" | "images">("documents");
  
  // Keine Mock-Daten mehr - echte Implementierung würde hier Channel-Context verwenden
  const files: File[] = [];

  const filteredFiles = files.filter((file) => 
    fileType === "documents" ? file.type === "document" : file.type === "image"
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Filter-Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={fileType === "documents" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setFileType("documents")}
          >
            <FileText className="w-4 h-4" />
            Dokumente
          </Button>
          <Button
            variant={fileType === "images" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setFileType("images")}
          >
            <Image className="w-4 h-4" />
            Bilder
          </Button>
        </div>

        {/* Dateiliste */}
        <div className="space-y-3">
          {filteredFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Keine Dateien vorhanden</p>
          ) : (
            filteredFiles.map((file) => (
            <div key={file.id} className="bg-muted rounded-xl p-4 space-y-2">
              {/* Datei-Header */}
              <div className="flex items-start gap-3">
                {/* Datei-Icon */}
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>

                {/* Datei-Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {file.size} • {file.date}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    von {file.uploader}
                  </p>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* "Alle Dateien anzeigen" Button */}
        <Button variant="outline" className="w-full">
          Alle Dateien anzeigen
        </Button>
      </div>
    </ScrollArea>
  );
}
