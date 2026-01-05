
import { useEffect, useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { OverviewTab } from "./OverviewTab";
import { TasksTab } from "./TasksTab";
import { ProjectsTab } from "./ProjectsTab";
import DocumentsTab from "./DocumentsTab";
import { AbsenceHistoryTabContent } from "../details/AbsenceHistoryTabContent";
import { WorkTimeAnalysisTabContent } from "../details/WorkTimeAnalysisTabContent";

interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
  status?: string;
}

interface SwipeableProfileViewProps {
  employee: Employee;
}

const tabs = [
  { id: 'overview', label: 'Übersicht', icon: '👤' },
  { id: 'tasks', label: 'Aufgaben', icon: <CheckSquare className="h-4 w-4" /> },
  { id: 'projects', label: 'Projekte', icon: '📁' },
  { id: 'documents', label: 'Dokumente', icon: '📄' },
  { id: 'absence-history', label: 'Abwesenheiten', icon: '📅' },
  { id: 'work-analysis', label: 'Arbeitszeiten', icon: '⏰' }
];

export const SwipeableProfileView = ({ employee }: SwipeableProfileViewProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: 'center', containScroll: 'trimSnaps', dragFree: false });

  const currentIndex = selectedIndex;

  const scrollTo = useCallback((index: number) => {
    if (!embla) return;
    embla.scrollTo(index);
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      const idx = embla.selectedScrollSnap();
      setSelectedIndex(idx);
      setActiveTab(tabs[idx].id);
    };
    embla.on('select', onSelect);
    onSelect();
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    const idx = tabs.findIndex(t => t.id === activeTab);
    if (idx >= 0) embla.scrollTo(idx);
  }, [activeTab, embla]);

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return <OverviewTab employeeId={employee.id} />;
      case 'tasks':
        return <TasksTab employeeId={employee.id} />;
      case 'projects':
        return <ProjectsTab employeeId={employee.id} projectAssignments={[]} />;
      case 'documents':
        return <DocumentsTab employeeId={employee.id} />;
      case 'absence-history':
        return <AbsenceHistoryTabContent employeeId={employee.id} />;
      case 'work-analysis':
        return <WorkTimeAnalysisTabContent employeeId={employee.id} />;
      default:
        return <OverviewTab employeeId={employee.id} />;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 overflow-x-hidden touch-pan-y overscroll-y-none">
      {/* Header */}
      <Card className="p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">{employee.name}</h1>
          {employee.position && (
            <p className="text-muted-foreground">{employee.position}</p>
          )}
          {employee.department && (
            <Badge variant="secondary" className="mt-2">
              {employee.department}
            </Badge>
          )}
        </div>
      </Card>

      {/* Swipeable container styled like a single card per view */}
      <div className="relative">
        <div className="overflow-hidden touch-pan-x overscroll-contain" ref={emblaRef}>
          <div className="flex gap-4 pl-4">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="min-w-0 flex-[0_0_88%] md:flex-[0_0_100%]">
                <Card
                  className={`relative h-[calc(100vh-10rem)] overflow-hidden rounded-3xl transition-all duration-300 ${
                    index === currentIndex ? 'scale-100 shadow-2xl' : 'scale-[0.97] opacity-90'
                  }`}
                >
                  {/* Top overlay header (mimics the card banner style) */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 via-background/30 to-transparent pointer-events-none" />

                  <div className="absolute left-4 top-4 flex items-center gap-2 z-10">
                    {typeof tab.icon === 'string' ? (
                      <span className="text-base">{tab.icon}</span>
                    ) : (
                      tab.icon
                    )}
                    <span className="font-medium text-sm">{tab.label}</span>
                  </div>

                  {/* Content area */}
                  <div className="h-full overflow-y-auto overflow-x-hidden p-4 pt-16 touch-pan-y overscroll-contain">
                    {renderTabContent(tab.id)}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next controls overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto"
            onClick={() => scrollTo((currentIndex - 1 + tabs.length) % tabs.length)}
            aria-label="Vorheriger Bereich"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="pointer-events-auto"
            onClick={() => scrollTo((currentIndex + 1) % tabs.length)}
            aria-label="Nächster Bereich"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={`Gehe zu ${tab.label}`}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-primary' : 'w-3 bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
