
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon } from "lucide-react";

interface RoadmapLinkSectionProps {
  project: any;
}

export const RoadmapLinkSection = ({ project }: RoadmapLinkSectionProps) => {
  const roadmapName = project.roadmap_link || null;

  if (!roadmapName) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Roadmap-Verknüpfung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Keine Roadmap verknüpft.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Roadmap-Verknüpfung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100">
          {roadmapName}
        </Badge>
      </CardContent>
    </Card>
  );
};
