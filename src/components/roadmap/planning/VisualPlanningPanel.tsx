import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  Clock,
  Users,
  Target,
  Settings,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  BarChart3,
  Layers
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RoadmapContainer, RoadmapCard } from '@/hooks/roadmap/useRoadmapPlanning';

interface VisualPlanningPanelProps {
  containers: RoadmapContainer[];
  cards: RoadmapCard[];
  selectedContainerId?: string;
  onSelectContainer: (containerId: string) => void;
  onEditContainer: (container: RoadmapContainer) => void;
  onDeleteContainer: (containerId: string) => void;
}

export const VisualPlanningPanel: React.FC<VisualPlanningPanelProps> = ({
  containers,
  cards,
  selectedContainerId,
  onSelectContainer,
  onEditContainer,
  onDeleteContainer
}) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isContainersOpen, setIsContainersOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContainers = containers.filter(container =>
    container.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getContainerCards = (containerId: string) => 
    cards.filter(card => card.container_id === containerId);

  const getStatusCounts = () => {
    const statusCounts = { planned: 0, in_progress: 0, done: 0, blocked: 0 };
    cards.forEach(card => {
      if (card.status && statusCounts.hasOwnProperty(card.status)) {
        statusCounts[card.status as keyof typeof statusCounts]++;
      }
    });
    return statusCounts;
  };

  const statusCounts = getStatusCounts();
  const totalCards = cards.length;
  const completionRate = totalCards > 0 ? Math.round((statusCounts.done / totalCards) * 100) : 0;

  return (
    <TooltipProvider>
      <Card className="absolute top-4 right-4 w-80 max-h-[calc(100vh-120px)] z-20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Planungsübersicht
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Container suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Overview Stats */}
              <Collapsible open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2">
                    <span className="font-medium">Übersicht</span>
                    {isOverviewOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">{containers.length}</div>
                      <div className="text-blue-600">Container</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900">{totalCards}</div>
                      <div className="text-green-600">Karten</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Fortschritt</span>
                      <span className="text-sm text-muted-foreground">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Status Statistics */}
              <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2">
                    <span className="font-medium">Status Statistiken</span>
                    {isStatsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span>Geplant</span>
                    </div>
                    <Badge variant="secondary">{statusCounts.planned}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span>In Bearbeitung</span>
                    </div>
                    <Badge variant="secondary">{statusCounts.in_progress}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span>Fertig</span>
                    </div>
                    <Badge variant="secondary">{statusCounts.done}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>Blockiert</span>
                    </div>
                    <Badge variant="secondary">{statusCounts.blocked}</Badge>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Container List */}
              <Collapsible open={isContainersOpen} onOpenChange={setIsContainersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2">
                    <span className="font-medium">Container ({filteredContainers.length})</span>
                    {isContainersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {filteredContainers.map((container) => {
                    const containerCards = getContainerCards(container.id);
                    const isSelected = selectedContainerId === container.id;
                    
                    return (
                      <div
                        key={container.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => onSelectContainer(container.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: container.color || '#3B82F6' }}
                            />
                            <span className="font-medium text-sm">{container.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditContainer(container);
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Container bearbeiten</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        
                        {container.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {container.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <span>{containerCards.length}</span>
                            </div>
                            {container.progress !== undefined && (
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                <span>{container.progress}%</span>
                              </div>
                            )}
                          </div>
                          {container.tags && container.tags.length > 0 && (
                            <div className="flex gap-1">
                              {container.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {container.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{container.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredContainers.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      {searchTerm ? 'Keine Container gefunden' : 'Keine Container vorhanden'}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};