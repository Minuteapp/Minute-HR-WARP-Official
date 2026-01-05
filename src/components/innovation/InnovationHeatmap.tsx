import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Map, TrendingUp, BarChart3 } from "lucide-react";

interface Idea {
  id: string;
  title: string;
  status: string;
  impact_score?: number;
  complexity_score?: number;
  estimated_roi?: number;
  predicted_success_probability?: number;
  tags?: string[];
}

interface InnovationHeatmapProps {
  ideas: Idea[];
}

export const InnovationHeatmap: React.FC<InnovationHeatmapProps> = ({ ideas }) => {
  const heatmapData = useMemo(() => {
    const maxImpact = 10;
    const maxComplexity = 10;
    const gridSize = 10;
    
    return ideas.filter(idea => 
      idea.impact_score && idea.complexity_score
    ).map(idea => ({
      ...idea,
      x: Math.min(Math.floor((idea.impact_score! / maxImpact) * gridSize), gridSize - 1),
      y: Math.min(Math.floor((idea.complexity_score! / maxComplexity) * gridSize), gridSize - 1),
      size: Math.max(8, Math.min(24, (idea.estimated_roi || 100) / 10)),
    }));
  }, [ideas]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981"; // green-500
      case "in_progress":
        return "#3b82f6"; // blue-500
      case "approved":
        return "#059669"; // emerald-600
      case "in_review":
        return "#f59e0b"; // yellow-500
      case "new":
        return "#6b7280"; // gray-500
      case "rejected":
        return "#ef4444"; // red-500
      default:
        return "#6b7280";
    }
  };

  const getQuadrantInfo = (x: number, y: number) => {
    if (x >= 5 && y < 5) return { label: "Quick Wins", color: "bg-green-100 border-green-300" };
    if (x >= 5 && y >= 5) return { label: "Major Projects", color: "bg-blue-100 border-blue-300" };
    if (x < 5 && y < 5) return { label: "Fill Ins", color: "bg-gray-100 border-gray-300" };
    if (x < 5 && y >= 5) return { label: "Questionable", color: "bg-red-100 border-red-300" };
    return { label: "", color: "" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Innovation Portfolio Heatmap
          </CardTitle>
          <CardDescription>
            Visualisierung aller Ideen nach Impact (X-Achse) vs. Complexity (Y-Achse). 
            Bubble-Größe = ROI Potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="relative">
              {/* Grid */}
              <div className="relative w-full h-96 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Quadrant Labels */}
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  Quick Wins
                </div>
                <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  Major Projects
                </div>
                <div className="absolute top-2 left-2 bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                  Fill Ins
                </div>
                <div className="absolute bottom-2 left-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                  Questionable
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0">
                  {/* Vertical center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>
                  {/* Horizontal center line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
                </div>

                {/* Data Points */}
                {heatmapData.map((idea) => {
                  const left = (idea.x / 10) * 100;
                  const bottom = (idea.y / 10) * 100;
                  
                  return (
                    <Tooltip key={idea.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute rounded-full cursor-pointer transition-all hover:scale-110 border-2 border-white shadow-lg"
                          style={{
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                            width: `${idea.size}px`,
                            height: `${idea.size}px`,
                            backgroundColor: getStatusColor(idea.status),
                            transform: 'translate(-50%, 50%)',
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{idea.title}</h4>
                          <div className="text-sm space-y-1">
                            <p>Impact: {idea.impact_score}/10</p>
                            <p>Complexity: {idea.complexity_score}/10</p>
                            <p>ROI: {idea.estimated_roi}%</p>
                            {idea.predicted_success_probability && (
                              <p>Erfolgswahrscheinlichkeit: {Math.round(idea.predicted_success_probability * 100)}%</p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {idea.tags?.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Axis Labels */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">Niediger Impact</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Impact Score</span>
                </div>
                <div className="text-sm text-muted-foreground">Hoher Impact</div>
              </div>

              <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Complexity</span>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legende & Portfolio Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Legend */}
            <div>
              <h4 className="font-medium mb-3">Status</h4>
              <div className="space-y-2">
                {[
                  { status: "new", label: "Neu", count: ideas.filter(i => i.status === "new").length },
                  { status: "in_review", label: "In Prüfung", count: ideas.filter(i => i.status === "in_review").length },
                  { status: "approved", label: "Genehmigt", count: ideas.filter(i => i.status === "approved").length },
                  { status: "in_progress", label: "In Umsetzung", count: ideas.filter(i => i.status === "in_progress").length },
                  { status: "completed", label: "Abgeschlossen", count: ideas.filter(i => i.status === "completed").length },
                ].map(({ status, label, count }) => (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    <span className="text-sm">{label}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Quadrant Insights */}
            <div>
              <h4 className="font-medium mb-3">Portfolio Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-800">Quick Wins: </span>
                  <span className="text-green-700">
                    {heatmapData.filter(i => i.x >= 5 && i.y < 5).length} Ideen - Hoher Impact, niedrige Complexity
                  </span>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-800">Major Projects: </span>
                  <span className="text-blue-700">
                    {heatmapData.filter(i => i.x >= 5 && i.y >= 5).length} Ideen - Hoher Impact, hohe Complexity
                  </span>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-yellow-800">Durchschnittlicher ROI: </span>
                  <span className="text-yellow-700">
                    {Math.round(ideas.reduce((acc, idea) => acc + (idea.estimated_roi || 0), 0) / ideas.length)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};