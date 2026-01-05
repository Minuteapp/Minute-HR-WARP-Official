
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Route, 
  Calendar, 
  Target, 
  ArrowRight,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRoadmaps } from "@/hooks/useRoadmaps";

export const RoadmapWidget = () => {
  const { roadmaps, isLoading } = useRoadmaps();

  const activeRoadmaps = roadmaps?.filter(r => r.status === 'active') || [];
  const upcomingMilestones = []; // Will be populated when milestone functionality is added

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht festgelegt';
    return new Date(dateString).toLocaleDateString('de-DE', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Roadmaps</CardTitle>
          <Route className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Roadmaps</CardTitle>
        <Route className="h-4 w-4 text-purple-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="font-semibold text-purple-900">{roadmaps?.length || 0}</div>
              <div className="text-purple-600">Gesamt</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-900">{activeRoadmaps.length}</div>
              <div className="text-green-600">Aktiv</div>
            </div>
          </div>

          {/* Active Roadmaps */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Aktive Roadmaps
            </h4>
            {activeRoadmaps.length > 0 ? (
              <div className="space-y-2">
                {activeRoadmaps.slice(0, 3).map(roadmap => (
                  <div key={roadmap.id} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {roadmap.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getStatusColor(roadmap.status)} text-xs`}>
                            Aktiv
                          </Badge>
                          {roadmap.end_date && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(roadmap.end_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {activeRoadmaps.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{activeRoadmaps.length - 3} weitere Roadmaps
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                <Route className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Keine aktiven Roadmaps</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <Link to="/projects/roadmap">
              <Button variant="outline" size="sm" className="w-full text-left justify-between">
                Alle Roadmaps anzeigen
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
