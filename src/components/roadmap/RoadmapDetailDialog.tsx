
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Route,
  Calendar,
  Target,
  Settings,
  Edit,
  X,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { toast } from "sonner";

interface RoadmapDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmap: any;
}

export const RoadmapDetailDialog = ({ open, onOpenChange, roadmap }: RoadmapDetailDialogProps) => {
  const { deleteRoadmap } = useRoadmaps();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'draft': return 'Entwurf';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht festgelegt';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    try {
      await deleteRoadmap.mutateAsync(roadmap.id);
      toast.success('Roadmap wurde gelöscht');
      onOpenChange(false);
    } catch (error) {
      toast.error('Fehler beim Löschen der Roadmap');
    }
  };

  if (!roadmap) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Route className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {roadmap.title}
                </DialogTitle>
                <Badge className={getStatusColor(roadmap.status)}>
                  {getStatusLabel(roadmap.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
                <TabsTrigger value="goals">Ziele</TabsTrigger>
                <TabsTrigger value="settings">Einstellungen</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Titel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">{roadmap.title}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Status
                        <Badge className={getStatusColor(roadmap.status)}>
                          {getStatusLabel(roadmap.status)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Startdatum</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(roadmap.start_date)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enddatum</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(roadmap.end_date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {roadmap.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Beschreibung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{roadmap.description}</p>
                    </CardContent>
                  </Card>
                )}

                {(roadmap.vision || roadmap.mission) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roadmap.vision && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Vision</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{roadmap.vision}</p>
                        </CardContent>
                      </Card>
                    )}

                    {roadmap.mission && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Mission</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{roadmap.mission}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="milestones" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Meilensteine
                      </h3>
                      {roadmap.milestones && roadmap.milestones.length > 0 ? (
                        <div className="space-y-2">
                          {roadmap.milestones.map((milestone: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium">{milestone.title}</span>
                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                              </div>
                              <Badge variant="outline">{milestone.status === 'completed' ? 'Abgeschlossen' : milestone.status === 'in_progress' ? 'In Bearbeitung' : 'Geplant'}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Keine Meilensteine definiert.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Strategische Ziele
                      </h3>
                      {roadmap.strategic_objectives && roadmap.strategic_objectives.length > 0 ? (
                        <div className="space-y-2">
                          {roadmap.strategic_objectives.map((objective: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium">{objective.title}</span>
                                <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                              </div>
                              <Badge variant="outline">{objective.status || 'Geplant'}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Keine strategischen Ziele definiert.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-red-600">Gefahrenzone</h3>
                      <p className="text-red-800">
                        Das Löschen einer Roadmap kann nicht rückgängig gemacht werden. Alle zugehörigen Meilensteine und Verknüpfungen gehen verloren.
                      </p>
                      <Button 
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Roadmap löschen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Roadmap löschen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Sind Sie sicher, dass Sie diese Roadmap löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    Abbrechen
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
