
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Clock } from "lucide-react";
import { Roadmap } from "@/hooks/useRoadmaps";

interface RoadmapTimelineProps {
  roadmaps: Roadmap[];
}

export const RoadmapTimeline = ({ roadmaps }: RoadmapTimelineProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'draft':
        return 'Entwurf';
      case 'archived':
        return 'Archiviert';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedRoadmaps = [...roadmaps].sort((a, b) => {
    if (!a.start_date && !b.start_date) return 0;
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  if (roadmaps.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Roadmaps verfügbar
        </h3>
        <p className="text-gray-500">
          Erstellen Sie Roadmaps, um sie in der Timeline zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">Roadmap Timeline</h2>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-purple-400"></div>

        <div className="space-y-8">
          {sortedRoadmaps.map((roadmap, index) => (
            <div key={roadmap.id} className="relative flex items-start gap-6">
              {/* Timeline Dot */}
              <div className="relative flex-shrink-0">
                <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                {index === 0 && (
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-100 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Content */}
              <Card className="flex-1 border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {roadmap.title}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(roadmap.status)}>
                          {getStatusLabel(roadmap.status)}
                        </Badge>
                        {roadmap.start_date && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Start: {formatDate(roadmap.start_date)}</span>
                          </div>
                        )}
                        {roadmap.end_date && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Target className="h-4 w-4" />
                            <span>Ende: {formatDate(roadmap.end_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(roadmap.created_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                {roadmap.description && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 line-clamp-2">
                      {roadmap.description}
                    </p>
                    
                    {(roadmap.vision || roadmap.mission) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roadmap.vision && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-purple-900 mb-1">Vision</h4>
                            <p className="text-sm text-purple-700 line-clamp-2">
                              {roadmap.vision}
                            </p>
                          </div>
                        )}
                        {roadmap.mission && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Mission</h4>
                            <p className="text-sm text-blue-700 line-clamp-2">
                              {roadmap.mission}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
