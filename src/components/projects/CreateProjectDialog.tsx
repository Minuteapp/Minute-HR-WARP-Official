import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Code, Server, Megaphone, Sparkles, ChevronRight } from "lucide-react";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  phases?: number;
  duration?: string;
  teamSize?: string;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const templates: ProjectTemplate[] = [
    {
      id: "blank",
      name: "Leeres Projekt",
      description: "Beginnen Sie von Grund auf neu",
      icon: FileText,
      color: "bg-gray-500",
    },
    {
      id: "software",
      name: "Software-Entwicklung",
      description: "Agile Entwicklung mit Sprints",
      icon: Code,
      color: "bg-blue-500",
      phases: 5,
      duration: "~180 Tage",
      teamSize: "6 Team-Mitglieder",
    },
    {
      id: "infrastructure",
      name: "IT-Infrastruktur",
      description: "Migration und Setup",
      icon: Server,
      color: "bg-purple-500",
      phases: 5,
      duration: "~120 Tage",
      teamSize: "6 Team-Mitglieder",
    },
    {
      id: "marketing",
      name: "Marketing-Kampagne",
      description: "Kampagnenplanung & Execution",
      icon: Megaphone,
      color: "bg-orange-500",
      phases: 5,
      duration: "~90 Tage",
      teamSize: "5 Team-Mitglieder",
    },
  ];

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    onOpenChange(false);
    setShowDetailsDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <DialogTitle>Neues Projekt erstellen</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Wählen Sie eine Vorlage aus oder starten Sie mit einem leeren Projekt
            </p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded ${template.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  {template.phases && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>{template.phases} Phasen</div>
                      <div>{template.duration}</div>
                      <div>{template.teamSize}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ProjectDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        template={selectedTemplate}
      />
    </>
  );
}
