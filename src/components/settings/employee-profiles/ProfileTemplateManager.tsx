
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Copy } from "lucide-react";

const ProfileTemplateManager = () => {
  const templates = [
    { id: 1, name: "Standard Mitarbeiter", description: "Grundlegende Felder für alle Mitarbeiter", fields: 12, usage: 85 },
    { id: 2, name: "Führungskraft", description: "Erweiterte Felder für Manager", fields: 18, usage: 23 },
    { id: 3, name: "Praktikant", description: "Reduzierte Felder für Praktikanten", fields: 8, usage: 12 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profil-Template Manager</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neues Template erstellen
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-sm">
                    <span className="font-medium">{template.fields}</span> Felder
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{template.usage}</span> Verwendungen
                  </div>
                </div>
                <Badge variant={template.usage > 50 ? "default" : "secondary"}>
                  {template.usage > 50 ? "Häufig verwendet" : "Selten verwendet"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfileTemplateManager;
