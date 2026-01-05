import { 
  Home, 
  CheckSquare, 
  Clock, 
  Briefcase, 
  FileText, 
  Bot,
  Settings,
  Calendar,
  Phone,
  BarChart3,
  Users,
  Globe,
  Shield,
  Zap,
  Workflow,
  ChevronDown,
  Mic,
  Brain
} from 'lucide-react';

export const navigationItems = [
  { name: 'Heute', path: '/today', icon: Home },
  { name: 'Aufgaben', path: '/tasks', icon: CheckSquare },
  { name: 'Zeit', path: '/time', icon: Clock },
  { name: 'Projekte', path: '/projects', icon: Briefcase },
  { name: 'Dokumente', path: '/documents', icon: FileText },
  { name: 'KI & Automatisierung', path: '/ai', icon: Bot },
  { name: '🎤 ALEX Voice', path: '/ai/voice-assistant', icon: Mic },
  { name: '🧠 Smart Insights', path: '/ai/smart-insights', icon: Brain }
];

export interface NavigationItem {
  name: string;
  path: string;
  icon: any;
  children?: NavigationItem[];
}