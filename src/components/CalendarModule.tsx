import { useState, useEffect } from "react";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarModuleContent } from "./calendar/CalendarModuleContent";
import { useCurrentUser } from "@/integrations/supabase/hooks/useCurrentUser";
import { getVisibleTabsForRole } from "@/config/calendarPermissions";
import { NewAppointmentDialog } from "./calendar/NewAppointmentDialog";
import { FilterDialog, FilterOptions } from "./calendar/FilterDialog";

export type CalendarView = "day" | "week" | "work-week" | "month" | "year";
export type CalendarTab = 
  | "my-appointments" 
  | "team-calendar" 
  | "company-calendar" 
  | "projects-roadmaps"
  | "shift-planning"
  | "absences-travel"
  | "workflows-approvals"
  | "ai-planning";

export type UserRole = "employee" | "team-leader" | "hr-manager" | "admin" | "auditor";

export function CalendarModule() {
  const [activeTab, setActiveTab] = useState<CalendarTab>("my-appointments");
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userRole, setUserRole] = useState<UserRole>("employee");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    eventTypes: ["appointment", "meeting", "task", "reminder", "absence", "project"],
    showAllDay: true,
    showRecurring: true,
    showPrivate: true,
  });
  
  const { data: currentUser } = useCurrentUser();
  
  // Wenn der aktive Tab für die Rolle nicht sichtbar ist,
  // wechsle zum ersten erlaubten Tab
  useEffect(() => {
    if (currentUser?.role) {
      const visibleTabs = getVisibleTabsForRole(currentUser.role);
      
      // Wenn der aktuelle Tab nicht erlaubt ist, wechsle zum ersten erlaubten
      if (!visibleTabs.includes(activeTab)) {
        setActiveTab(visibleTabs[0] || "my-appointments");
      }
    }
  }, [currentUser?.role, activeTab]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    console.log('Applied filters:', newFilters);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          view={view}
          setView={setView}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          userRole={userRole}
          setUserRole={setUserRole}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          onNewAppointment={() => setIsNewAppointmentOpen(true)}
          onOpenFilter={() => setIsFilterOpen(true)}
        />
        <CalendarModuleContent 
          activeTab={activeTab}
          view={view}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          userRole={userRole}
          zoomLevel={zoomLevel}
        />
      </div>
      
      <NewAppointmentDialog
        open={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
      />
      
      <FilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
