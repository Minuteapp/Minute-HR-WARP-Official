import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Users, 
  Building2, 
  FolderKanban, 
  CalendarClock, 
  Plane, 
  Workflow, 
  Bot,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  ZoomIn,
  ZoomOut,
  User,
  Search,
  ArrowLeft,
  Bell,
  Cloud,
  CloudRain,
  Sun,
  Filter
} from "lucide-react";
import { CalendarTab, CalendarView, UserRole } from "../CalendarModule";
import { useCurrentUser } from "@/integrations/supabase/hooks/useCurrentUser";
import { isTabVisibleForRole } from "@/config/calendarPermissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CalendarHeaderProps {
  activeTab: CalendarTab;
  setActiveTab: (tab: CalendarTab) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  onNewAppointment: () => void;
  onOpenFilter: () => void;
}

const tabConfig = [
  { value: "my-appointments" as const, label: "Meine Termine", icon: Calendar },
  { value: "team-calendar" as const, label: "Team-Kalender", icon: Users },
  { value: "company-calendar" as const, label: "Unternehmens-Kalender", icon: Building2 },
  { value: "projects-roadmaps" as const, label: "Projekte & Roadmaps", icon: FolderKanban },
  { value: "shift-planning" as const, label: "Schicht-Planung", icon: CalendarClock },
  { value: "absences-travel" as const, label: "Abwesenheiten & Reisen", icon: Plane },
  { value: "workflows-approvals" as const, label: "Workflows", icon: Workflow },
  { value: "ai-planning" as const, label: "KI-Planung", icon: Bot },
];

export function CalendarHeader({
  activeTab,
  setActiveTab,
  view,
  setView,
  currentDate,
  setCurrentDate,
  userRole,
  setUserRole,
  zoomLevel,
  setZoomLevel,
  onNewAppointment,
  onOpenFilter,
}: CalendarHeaderProps) {
  
  const { data: currentUser } = useCurrentUser();
  
  // Hole die tatsächliche Rolle des Benutzers (berücksichtigt auch Role Preview)
  const effectiveRole = currentUser?.role || 'employee';
  
  // Filtere die Tabs basierend auf der Benutzerrolle
  const visibleTabs = tabConfig.filter(tab => 
    isTabVisibleForRole(tab.value, effectiveRole)
  );
  
  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    
    const multiplier = direction === 'prev' ? -1 : 1;
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + multiplier);
        break;
      case 'week':
      case 'work-week':
        newDate.setDate(newDate.getDate() + (7 * multiplier));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + multiplier);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + multiplier);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    return format(currentDate, "MMMM yyyy", { locale: de });
  };

  return (
    <div className="border-b bg-card space-y-2">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Button variant="default" size="sm" onClick={onNewAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Termin
        </Button>
        
        <div className="flex items-center gap-4">
          {/* Wetter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">22°C</span>
            <span className="text-xs text-muted-foreground">Sonnig</span>
          </div>
          
          {/* Filter */}
          <Button variant="outline" size="sm" onClick={onOpenFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filtern
          </Button>
        </div>
      </div>

      {/* Calendar Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold">Kalender</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => navigateDate('today')}
            >
              Heute
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {format(currentDate, "d. MMM.", { locale: de })}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(currentDate, "yyyy", { locale: de })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs">{Math.round(zoomLevel * 100)}%</span>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/30 h-8">
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                className={`px-2 py-1 text-xs h-7 ${
                  view === 'day' 
                    ? 'bg-[#6366f1] text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tag
              </Button>
              <Button
                variant={view === 'work-week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('work-week')}
                className={`px-2 py-1 text-xs h-7 ${
                  view === 'work-week' 
                    ? 'bg-[#6366f1] text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Arbeitswoche
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className={`px-2 py-1 text-xs h-7 ${
                  view === 'week' 
                    ? 'bg-[#6366f1] text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Woche
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className={`px-2 py-1 text-xs h-7 ${
                  view === 'month' 
                    ? 'bg-[#6366f1] text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monat
              </Button>
              <Button
                variant={view === 'year' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('year')}
                className={`px-2 py-1 text-xs h-7 ${
                  view === 'year' 
                    ? 'bg-[#6366f1] text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Jahr
              </Button>
            </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 overflow-x-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalendarTab)}>
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

    </div>
  );
}
