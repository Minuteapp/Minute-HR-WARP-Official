import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ZoomIn, ZoomOut, Maximize2, Network, Plus } from "lucide-react";
import { InfoBanner } from "../components/InfoBanner";
import { PerformanceBanner } from "../components/PerformanceBanner";
import { OrgChartNodeCard, OrgChartNode } from "../components/OrgChartNodeCard";
import { OrgChartTeamNode, OrgChartTeam } from "../components/OrgChartTeamNode";
import { OrgChartDetailPanel } from "../components/OrgChartDetailPanel";
import { OrgChartSidebar } from "../components/OrgChartSidebar";
import { VerticalLine, ChildBranch } from "../components/OrgChartConnector";
import { MigrateEmployeesButton } from "../components/MigrateEmployeesButton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationChartService } from "@/services/organizationChartService";

interface HierarchyNode {
  id: string;
  name: string;
  unit_type: string;
  level: number;
  location?: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
    email?: string;
    status?: string;
  } | null;
  roles?: any[];
  children: HierarchyNode[];
  employeeCount: number;
  teamsCount: number;
  openPositions: number;
  performance: number;
}

export const OrganizationChartTab = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelDisplay, setLevelDisplay] = useState('all');
  const [zoom, setZoom] = useState(100);
  const [filter, setFilter] = useState<'all' | 'active' | 'vacant' | 'planned'>('all');
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const handleMigrationComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['organization-hierarchy'] });
  };

  // Echte Daten aus der Datenbank laden
  const { data: hierarchy, isLoading } = useQuery({
    queryKey: ['organization-hierarchy', filter],
    queryFn: () => organizationChartService.getOrganizationHierarchy(
      filter !== 'all' ? { status: filter } : undefined
    )
  });

  const handleNodeSelect = (node: HierarchyNode) => {
    setSelectedNode(node);
    setPanelExpanded(true);
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Filter nach Suchbegriff
  const filterNodes = (nodes: HierarchyNode[]): HierarchyNode[] => {
    if (!searchTerm) return nodes;
    return nodes.filter(node => {
      const managerName = node.manager 
        ? `${node.manager.first_name} ${node.manager.last_name}`.toLowerCase()
        : '';
      const matchesSelf = 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        managerName.includes(searchTerm.toLowerCase());
      const matchingChildren = filterNodes(node.children);
      return matchesSelf || matchingChildren.length > 0;
    }).map(node => ({
      ...node,
      children: filterNodes(node.children)
    }));
  };

  // Hierarchie rekursiv rendern
  const renderNode = (node: HierarchyNode, depth: number = 0) => {
    const maxLevel = levelDisplay === 'all' ? Infinity : parseInt(levelDisplay);
    if (depth >= maxLevel) return null;

    const isExpanded = expandedNodes[node.id] ?? true;
    const isSelected = selectedNode?.id === node.id;
    const isVacant = !node.manager;

    const orgNode: OrgChartNode = {
      id: node.id,
      name: node.manager 
        ? `${node.manager.first_name} ${node.manager.last_name}`
        : 'Vakant',
      position: node.manager?.position || node.unit_type,
      department: node.name,
      location: node.location,
      isVacant,
      teamsCount: node.children.length,
      metrics: {
        employees: node.employeeCount,
        teams: node.teamsCount,
        vacancies: node.openPositions,
        performance: node.performance
      }
    };

    return (
      <div key={node.id} className="flex flex-col items-center">
        <OrgChartNodeCard
          node={orgNode}
          isSelected={isSelected}
          onSelect={() => handleNodeSelect(node)}
          onExpandTeams={node.children.length > 0 ? () => toggleNodeExpansion(node.id) : undefined}
          teamsExpanded={isExpanded}
        />

        {/* Kinder */}
        {isExpanded && node.children.length > 0 && (
          <>
            <VerticalLine height={24} />
            
            {/* Horizontale Verbindung für mehrere Kinder */}
            {node.children.length > 1 && (
              <div className="relative flex items-start">
                <div 
                  className="absolute top-0 h-0.5 bg-blue-500" 
                  style={{ 
                    left: 'calc(50% - ' + ((node.children.length - 1) * 80) + 'px)',
                    width: (node.children.length - 1) * 160 + 'px'
                  }} 
                />
              </div>
            )}

            <div className="flex items-start gap-6 pt-0">
              {node.children.map((child, index) => (
                <ChildBranch key={child.id}>
                  {renderNode(child, depth + 1)}
                </ChildBranch>
              ))}
            </div>
          </>
        )}

        {/* Teams (untergeordnete Einheiten als Team-Karten) */}
        {isExpanded && node.children.length === 0 && node.roles && node.roles.length > 0 && (
          <>
            <VerticalLine height={16} />
            <div className="flex flex-wrap gap-3 justify-center max-w-md">
              {node.roles.slice(0, 4).map((role: any) => {
                const team: OrgChartTeam = {
                  id: role.id,
                  name: role.role_type || 'Teammitglied',
                  lead: role.user ? `${role.user.first_name} ${role.user.last_name}` : undefined,
                  employeeCount: 1,
                  performance: Math.floor(Math.random() * 20) + 80
                };
                return (
                  <OrgChartTeamNode
                    key={role.id}
                    team={team}
                    isSelected={false}
                    onSelect={() => {}}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const filteredHierarchy = hierarchy ? filterNodes(hierarchy) : [];

  // Empty State
  if (!isLoading && (!hierarchy || hierarchy.length === 0)) {
    return (
      <div className="flex gap-6">
        <div className="flex-1">
          <EmptyState
            icon={Network}
            title="Kein Organigramm vorhanden"
            description="Es wurden noch keine Mitarbeiter mit Organisationseinheiten verknüpft. Nutzen Sie die Synchronisierung, um bestehende Mitarbeiter ins Organigramm zu übernehmen, oder weisen Sie neue Mitarbeiter beim Anlegen einer Abteilung zu."
            action={
              <div className="flex gap-3">
                <MigrateEmployeesButton onMigrationComplete={handleMigrationComplete} />
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Struktur anlegen
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Hauptbereich */}
      <div className="flex-1 space-y-4">
        <InfoBanner />
        <PerformanceBanner />
        
        {/* Toolbar */}
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Mitarbeiter oder Abteilung suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={levelDisplay} onValueChange={setLevelDisplay}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Ebene anzeigen</SelectItem>
                  <SelectItem value="2">2 Ebenen anzeigen</SelectItem>
                  <SelectItem value="3">3 Ebenen anzeigen</SelectItem>
                  <SelectItem value="all">Alle Ebenen</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Alle
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                >
                  Aktiv
                </Button>
                <Button
                  variant={filter === 'vacant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('vacant')}
                >
                  Vakant
                </Button>
                <Button
                  variant={filter === 'planned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('planned')}
                >
                  Geplant
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setZoom(100)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Organigramm */}
        <div 
          className="bg-slate-50 border rounded-lg p-8 overflow-auto"
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center', 
            minHeight: '600px' 
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Lade Organigramm...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0">
              {filteredHierarchy.map(node => renderNode(node, 0))}
            </div>
          )}
        </div>
        
        {/* Detail-Panel */}
        {selectedNode && (
          <OrgChartDetailPanel
            unit={{
              id: selectedNode.id,
              name: selectedNode.name,
              type: selectedNode.unit_type,
              manager: selectedNode.manager 
                ? `${selectedNode.manager.first_name} ${selectedNode.manager.last_name}`
                : null,
              location: selectedNode.location,
              metrics: {
                employees: selectedNode.employeeCount,
                teams: selectedNode.teamsCount,
                goalAchievement: selectedNode.performance,
                budget: 0,
                vacancies: selectedNode.openPositions
              },
              roles: selectedNode.roles
            }}
            expanded={panelExpanded}
            onToggle={() => setPanelExpanded(!panelExpanded)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
      
      {/* Rechte Seitenleiste */}
      <div className="w-80">
        <OrgChartSidebar />
      </div>
    </div>
  );
};
