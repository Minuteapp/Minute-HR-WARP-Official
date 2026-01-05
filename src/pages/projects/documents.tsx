
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Briefcase, BarChart, ListTodo, CalendarDays, Users, Settings, Upload, Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentList } from "@/components/projects/DocumentList";
import DocumentUploadDialog from "@/components/projects/DocumentUploadDialog";

export default function DocumentsPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Beispielprojekte - in einem echten Szenario würden diese aus einer API geladen
  const projects = [
    { id: "proj1", name: "Website Relaunch" },
    { id: "proj2", name: "Mobile App Entwicklung" },
    { id: "proj3", name: "CRM Integration" },
    { id: "proj4", name: "Cloud Migration" }
  ];

  const handleDocumentUploaded = () => {
    // Hier würde die Liste aktualisiert werden
    console.log("Dokument wurde hochgeladen");
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Projektmanagement</h1>
          </div>
        </div>
        
        <div className="flex overflow-x-auto py-2 gap-1 border-b">
          <Link to="/projects">
            <Button variant="ghost" className="rounded-md">
              <BarChart className="h-4 w-4 mr-2" />
              Übersicht
            </Button>
          </Link>
          <Link to="/projects/manage">
            <Button variant="ghost" className="rounded-md">
              <ListTodo className="h-4 w-4 mr-2" />
              Projekte verwalten
            </Button>
          </Link>
          <Link to="/projects/timeline">
            <Button variant="ghost" className="rounded-md">
              <CalendarDays className="h-4 w-4 mr-2" />
              Zeitplan
            </Button>
          </Link>
          <Link to="/projects/documents">
            <Button variant="default" className="rounded-md">
              <FileText className="h-4 w-4 mr-2" />
              Dokumente
            </Button>
          </Link>
          <Link to="/projects/team">
            <Button variant="ghost" className="rounded-md">
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
          </Link>
          <Link to="/projects/settings">
            <Button variant="ghost" className="rounded-md">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex items-center gap-4">
          <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Projekt auswählen" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Dokumente durchsuchen"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => setShowUploadDialog(true)} disabled={!selectedProject}>
          <Upload className="h-4 w-4 mr-2" />
          Dokument hochladen
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Projektdokumente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!selectedProject ? (
            <div className="text-center p-10 bg-gray-50 rounded-md border">
              <h3 className="text-lg font-medium">Dokumentenübersicht</h3>
              <p className="text-gray-500 mt-2">Bitte wählen Sie ein Projekt aus, um dessen Dokumente anzuzeigen.</p>
            </div>
          ) : (
            <DocumentList 
              projectId={selectedProject} 
            />
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <DocumentUploadDialog
          projectId={selectedProject}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
}
