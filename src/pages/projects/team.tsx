
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Briefcase, BarChart, ListTodo, CalendarDays, FileText, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
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
            <Button variant="ghost" className="rounded-md">
              <FileText className="h-4 w-4 mr-2" />
              Dokumente
            </Button>
          </Link>
          <Link to="/projects/team">
            <Button variant="default" className="rounded-md">
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

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Projektteam
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center p-10 bg-gray-50 rounded-md border">
            <h3 className="text-lg font-medium">Teamübersicht</h3>
            <p className="text-gray-500 mt-2">Bitte wählen Sie ein Projekt aus, um dessen Teammitglieder anzuzeigen.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
