import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, Clock, User, Eye, RotateCcw, Download, 
  Upload, Check, X, GitBranch, Calendar, FileJson
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DashboardVersion {
  id: string;
  version_number: number;
  version_name: string;
  dashboard_template_name: string;
  is_published: boolean;
  published_at: Date | null;
  published_by: string | null;
  created_by: string;
  created_at: Date;
  widget_count: number;
  changes_summary: string;
}

const defaultVersions: DashboardVersion[] = [];

export const DashboardVersionHistory: React.FC = () => {
  const [versions, setVersions] = useState<DashboardVersion[]>(defaultVersions);
  const [selectedVersion, setSelectedVersion] = useState<DashboardVersion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleRollback = (version: DashboardVersion) => {
    toast.success(`Rollback zu ${version.version_name} erfolgreich`);
  };

  const handlePublish = (version: DashboardVersion) => {
    setVersions(vs => 
      vs.map(v => ({
        ...v,
        is_published: v.id === version.id ? true : 
          (v.dashboard_template_name === version.dashboard_template_name ? false : v.is_published)
      }))
    );
    toast.success(`${version.version_name} veröffentlicht`);
  };

  const handleExport = (version: DashboardVersion) => {
    toast.success(`${version.version_name} exportiert`);
  };

  const groupedVersions = versions.reduce((acc, version) => {
    if (!acc[version.dashboard_template_name]) {
      acc[version.dashboard_template_name] = [];
    }
    acc[version.dashboard_template_name].push(version);
    return acc;
  }, {} as Record<string, DashboardVersion[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard-Versionen</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importieren
              </Button>
              <Button>
                <GitBranch className="h-4 w-4 mr-2" />
                Neue Version
              </Button>
            </div>
          </div>
          <CardDescription>
            Verwalten Sie Dashboard-Versionen und führen Sie Rollbacks durch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-6">
              {Object.entries(groupedVersions).map(([templateName, templateVersions]) => (
                <div key={templateName}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-base py-1">
                      {templateName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {templateVersions.length} Versionen
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Erstellt von</TableHead>
                        <TableHead>Widgets</TableHead>
                        <TableHead>Änderungen</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[150px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templateVersions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{version.version_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(version.created_at, 'dd.MM.yyyy', { locale: de })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {version.created_by}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{version.widget_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {version.changes_summary}
                            </span>
                          </TableCell>
                          <TableCell>
                            {version.is_published ? (
                              <Badge className="bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Aktiv
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Entwurf
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedVersion(version);
                                  setIsPreviewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleExport(version)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {!version.is_published && (
                                <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Version veröffentlichen?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Möchten Sie {version.version_name} für {version.dashboard_template_name} veröffentlichen?
                                          Die aktuelle aktive Version wird dadurch ersetzt.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handlePublish(version)}>
                                          Veröffentlichen
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <RotateCcw className="h-4 w-4 text-orange-600" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Rollback durchführen?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Möchten Sie zu {version.version_name} zurückkehren?
                                          Dies ersetzt die aktuelle Konfiguration.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRollback(version)}>
                                          Rollback
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Version Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              {selectedVersion?.version_name} - Konfiguration
            </DialogTitle>
            <DialogDescription>
              Detaillierte Ansicht der Dashboard-Konfiguration
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Dashboard</Label>
                  <p className="font-medium">{selectedVersion.dashboard_template_name}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Widgets</Label>
                  <p className="font-medium">{selectedVersion.widget_count} Widgets</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground">Erstellt von</Label>
                  <p className="font-medium">{selectedVersion.created_by}</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Änderungen</Label>
                <p>{selectedVersion.changes_summary}</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/50">
                <Label className="text-xs text-muted-foreground mb-2 block">Konfiguration (JSON)</Label>
                <pre className="text-xs overflow-auto max-h-48">
                  {JSON.stringify({
                    version: selectedVersion.version_number,
                    name: selectedVersion.version_name,
                    template: selectedVersion.dashboard_template_name,
                    widgets: selectedVersion.widget_count,
                    layout: { cols: 4, rows: 'auto' },
                    created_at: selectedVersion.created_at.toISOString()
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Schließen
            </Button>
            {selectedVersion && !selectedVersion.is_published && (
              <Button onClick={() => {
                handlePublish(selectedVersion);
                setIsPreviewOpen(false);
              }}>
                Veröffentlichen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardVersionHistory;
