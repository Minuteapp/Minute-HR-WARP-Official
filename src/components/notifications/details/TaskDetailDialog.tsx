import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, TrendingUp, User, Calendar, FileText, MessageSquare, Paperclip, CheckCircle2, Circle } from "lucide-react";
import { Notification } from "@/types/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface TaskDetailDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ notification, open, onOpenChange }: TaskDetailDialogProps) {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl">Q3 Performance Reviews abschließen</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="destructive" className="bg-red-600">
                  <FileText className="h-3 w-3 mr-1" />
                  Hoch Priorität
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  In Bearbeitung
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                  Aufgaben · Performance Management
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Deadline Alert */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-semibold text-orange-900">Deadline heute um 17:00 Uhr</h3>
                <p className="text-sm text-orange-800">
                  Diese Aufgabe hat 5 abhängige Aufgaben. Eine Verzögerung würde den gesamten Performance Review Prozess beeinflussen.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Beschreibung</h3>
            <p className="text-sm text-muted-foreground">
              Führe die finalen Performance Reviews für alle Teammitglieder durch und stelle sicher, dass alle Feedback-Gespräche dokumentiert sind. Die Ergebnisse müssen bis EOD an die HR-Abteilung übermittelt werden.
            </p>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Zugewiesen von</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">SM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Sarah Müller</p>
                  <p className="text-xs text-muted-foreground">HR Manager</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Fälligkeitsdatum</span>
              </div>
              <p className="font-medium text-red-600">13.10.2025, 17:00 Uhr</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Zeitaufwand</span>
              </div>
              <p className="font-medium">2.5 Stunden / 4 Stunden</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Fortschritt</span>
              </div>
              <div className="space-y-1">
                <Progress value={65} className="h-2" />
                <p className="font-medium text-sm">65%</p>
              </div>
            </div>
          </div>

          {/* Dependent Tasks */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Abhängige Aufgaben (5)
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Team-Interviews abschließen</span>
                </div>
                <Badge variant="outline" className="bg-black text-white border-black">Abgeschlossen</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Feedback-Formulare sammeln</span>
                </div>
                <Badge variant="outline" className="bg-black text-white border-black">Abgeschlossen</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Circle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Zielerreichung bewerten</span>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">In Arbeit</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                <div className="flex items-center gap-3">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Entwicklungsplan erstellen</span>
                </div>
                <Badge variant="outline">Ausstehend</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                <div className="flex items-center gap-3">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">HR-Dokumentation vorbereiten</span>
                </div>
                <Badge variant="outline">Ausstehend</Badge>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Anhänge (3)
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Performance_Review_Template.docx</p>
                    <p className="text-xs text-muted-foreground">245 KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Öffnen</Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Q3_Team_Metrics.xlsx</p>
                    <p className="text-xs text-muted-foreground">1.2 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Öffnen</Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Feedback_Guidelines.pdf</p>
                    <p className="text-xs text-muted-foreground">892 KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Öffnen</Button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Kommentare (2)
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">SM</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Sarah Müller</p>
                    <span className="text-xs text-muted-foreground">13.10.2025, 10:30</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bitte stelle sicher, dass alle Reviews die neuen Kompetenzkritierien berücksichtigen.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">TW</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Thomas Weber</p>
                    <span className="text-xs text-muted-foreground">13.10.2025, 12:15</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ich habe meine Selbsteinschätzung bereits hochgeladen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            Zuweisen
          </Button>
          <Button variant="outline" className="gap-2">
            <Paperclip className="h-4 w-4" />
            Anhang
          </Button>
          <Button variant="outline">Verschieben</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Als erledigt markieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
