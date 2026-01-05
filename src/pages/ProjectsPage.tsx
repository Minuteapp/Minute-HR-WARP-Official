import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  FileText,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  FileStack,
  Clock,
  Bell,
} from "lucide-react";
import ProjectPortfolio from "./projects/ProjectPortfolio";
import ProjectsList from "./projects/ProjectsList";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { TaskKanbanBoard } from "@/components/projects/kanban/TaskKanbanBoard";
import { ProjectTimeline } from "@/components/projects/timeline/ProjectTimeline";
import { WBSView } from "@/components/projects/wbs/WBSView";
import { ResourcesView } from "@/components/projects/resources/ResourcesView";
import { BudgetView } from "@/components/projects/budget/BudgetView";
import { RisksView } from "@/components/projects/risks/RisksView";
import { DocumentsView } from "@/components/projects/documents/DocumentsView";
import { ReportsView } from "@/components/projects/reports/ReportsView";
import { AuditView } from "@/components/projects/audit/AuditView";

const ProjectsPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("portfolio");

  const navigationTabs = [
    { id: "portfolio", label: "Portfolio", icon: LayoutGrid, badge: "Vorschau" },
    { id: "projects", label: "Projekte", icon: FileText },
    { id: "kanban", label: "Kanban", icon: BarChart3 },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "wbs", label: "WBS", icon: FileStack },
    { id: "resources", label: "Ressourcen", icon: Users },
    { id: "budget", label: "Budget", icon: DollarSign },
    { id: "risks", label: "Risiken", icon: AlertTriangle },
    { id: "documents", label: "Dokumente", icon: FileText },
    { id: "reports", label: "Berichte", icon: BarChart3 },
    { id: "audit", label: "Audit", icon: Clock },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">PROJEKTE</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                Admin
              </Badge>
              <Badge variant="destructive">11 Tabs</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Suchen..." className="pl-9 w-64" />
            </div>
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              Neu
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              Profil
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {navigationTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeMainTab === "portfolio" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alle Abteilungen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Abteilungen</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-locations">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alle Standorte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">Alle Standorte</SelectItem>
                    <SelectItem value="de">Deutschland</SelectItem>
                    <SelectItem value="at">Österreich</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-programs">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alle Programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-programs">Alle Programme</SelectItem>
                    <SelectItem value="dt">Digital Transformation</SelectItem>
                    <SelectItem value="cx">Customer Experience</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-okrs">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alle OKRs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-okrs">Alle OKRs</SelectItem>
                    <SelectItem value="q1">Q1 2025</SelectItem>
                    <SelectItem value="q2">Q2 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                OKR-Overlay anzeigen
              </Button>
            </div>

            <ProjectPortfolio />
          </div>
        )}

        {activeMainTab === "projects" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Neues Projekt
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Aus Template
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ProjectsList />
          </div>
        )}

        {activeMainTab === "kanban" && (
          <div className="p-6">
            <TaskKanbanBoard />
          </div>
        )}

        {activeMainTab === "timeline" && (
          <div className="p-6">
            <ProjectTimeline />
          </div>
        )}

        {activeMainTab === "wbs" && (
          <div className="p-6">
            <WBSView />
          </div>
        )}

        {activeMainTab === "resources" && (
          <div className="p-6">
            <ResourcesView />
          </div>
        )}

        {activeMainTab === "budget" && (
          <div className="p-6">
            <BudgetView />
          </div>
        )}

        {activeMainTab === "risks" && (
          <div className="p-6">
            <RisksView />
          </div>
        )}

        {activeMainTab === "documents" && (
          <div className="p-6">
            <DocumentsView />
          </div>
        )}

        {activeMainTab === "reports" && (
          <div className="p-6">
            <ReportsView />
          </div>
        )}

        {activeMainTab === "audit" && (
          <div className="p-6">
            <AuditView />
          </div>
        )}
      </div>

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
};

export default ProjectsPage;