import { Bell, FileText, CheckSquare, Info, Calendar, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Sparkles } from "lucide-react";

export type NotificationCategoryType = 'all' | 'new' | 'requests' | 'tasks' | 'info' | 'events' | 'system';

interface CategoryTab {
  id: NotificationCategoryType;
  label: string;
  icon: React.ReactNode;
  count: number;
}

interface NotificationCategoryTabsProps {
  activeCategory: NotificationCategoryType;
  onCategoryChange: (category: NotificationCategoryType) => void;
  counts: {
    all: number;
    new: number;
    requests: number;
    tasks: number;
    info: number;
    events: number;
    system: number;
  };
}

const NotificationCategoryTabs = ({ 
  activeCategory, 
  onCategoryChange,
  counts 
}: NotificationCategoryTabsProps) => {
  const categories: CategoryTab[] = [
    { id: 'all', label: 'Alle', icon: <Bell className="h-4 w-4" />, count: counts.all },
    { id: 'new', label: 'Neu', icon: <Sparkles className="h-4 w-4" />, count: counts.new },
    { id: 'requests', label: 'Anfragen & Freigaben', icon: <FileText className="h-4 w-4" />, count: counts.requests },
    { id: 'tasks', label: 'Aufgaben & Projekte', icon: <CheckSquare className="h-4 w-4" />, count: counts.tasks },
    { id: 'info', label: 'Informationen', icon: <Info className="h-4 w-4" />, count: counts.info },
    { id: 'events', label: 'Termine & Events', icon: <Calendar className="h-4 w-4" />, count: counts.events },
    { id: 'system', label: 'System', icon: <Settings className="h-4 w-4" />, count: counts.system },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            activeCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.icon}
          <span className="text-sm font-medium">{category.label}</span>
          <Badge 
            variant="secondary" 
            className={`ml-1 h-5 min-w-[20px] px-1.5 ${
              activeCategory === category.id 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {category.count}
          </Badge>
        </button>
      ))}
    </div>
  );
};

export default NotificationCategoryTabs;
