
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const ProjectTemplateSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Projektvorlagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Vorlagen und Standards für neue Projekte verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTemplateSettings;
