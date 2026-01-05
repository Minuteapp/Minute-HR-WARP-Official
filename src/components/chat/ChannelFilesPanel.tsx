import { useState } from 'react';
import { FileText, Image, Download, CheckSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChannelFiles } from '@/hooks/useChannelFiles';
import { formatFileSize } from '@/lib/utils';

interface ChannelFilesPanelProps {
  channelId: string;
}

const ChannelFilesPanel = ({ channelId }: ChannelFilesPanelProps) => {
  const { files, loading, downloadFile } = useChannelFiles(channelId);
  const [activeTab, setActiveTab] = useState<'documents' | 'images'>('documents');

  const documents = files.filter(f => !f.file_type.startsWith('image/'));
  const images = files.filter(f => f.file_type.startsWith('image/'));

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('figma')) return '🎨';
    return '📎';
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Dateien werden geladen...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="documents" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Dokumente ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="images" className="flex-1">
            <Image className="w-4 h-4 mr-2" />
            Bilder ({images.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-2 mt-4">
          {documents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Keine Dokumente vorhanden
            </div>
          ) : (
            <>
              {documents.map((file) => (
                <Card key={file.id} className="hover:bg-accent transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFile(file.file_path, file.file_name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="link" className="w-full mt-4">
                Alle Dateien anzeigen
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          {images.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Keine Bilder vorhanden
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {images.map((file) => (
                <Card
                  key={file.id}
                  className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => downloadFile(file.file_path, file.file_name)}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs truncate">{file.file_name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Integrationen
        </h4>
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Aufgaben</p>
              <p className="text-sm text-muted-foreground">
                3 verknüpfte Aufgaben
              </p>
            </div>
            <Badge variant="secondary">3</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChannelFilesPanel;
