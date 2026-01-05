import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, FileText, DollarSign, Clock, Plane, Target, GraduationCap, FolderOpen, Receipt, MessageSquare, Shield, Leaf, CheckSquare, Heart, Calendar, MapPin, AlertTriangle, BarChart3, Star, Car, TrendingUp, UserPlus, Users, Award, FileEdit, Trophy, Gift, Activity, Wifi, ClipboardList, StickyNote, MoreHorizontal } from "lucide-react";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useAuth } from "@/contexts/AuthContext";

// Mapping von Tab-Values zu Modul-Keys
const TAB_MODULE_MAP: Record<string, string> = {
  'overview': 'employees',
  'profile': 'profil',
  'employment': 'employees',
  'documents': 'documents',
  'salary': 'payroll',
  'time': 'time_tracking',
  'vacation': 'absence',
  'absence-history': 'absence',
  'work-analysis': 'time_tracking',
  'planning': 'planung',
  'career': 'employees',
  'onboarding': 'employees',
  'feedback-360': 'employees',
  'certificates': 'training',
  'hr-notes': 'employees',
  'tasks': 'tasks',
  'goals': 'goals',
  'training': 'training',
  'projects': 'projects',
  'expenses': 'expenses',
  'awards': 'employees',
  'benefits': 'employees',
  'health': 'employees',
  'remote-work': 'employees',
  'communication': 'communication',
  'surveys': 'communication',
  'roles': 'admin',
  'notes': 'employees',
  'sustainability': 'sustainability',
  'sick-leave': 'absence',
  'shift-planning': 'planung',
  'business-travel': 'business_travel',
  'compliance-hub': 'compliance',
  'miscellaneous': 'employees',
  'performance': 'employees',
  'skills': 'skills',
  'fleet': 'fleet'
};

export const TabNavigation = () => {
  const { hasAccess } = useEnterprisePermissions();
  const { user } = useAuth();
  
  // SuperAdmin sieht alles
  const isSuperAdmin = user?.role === 'superadmin' || user?.user_metadata?.role === 'superadmin';
  
  // Hilfsfunktion: Prüft ob ein Tab sichtbar sein soll
  const isTabVisible = (tabValue: string): boolean => {
    if (isSuperAdmin) return true;
    
    const moduleKey = TAB_MODULE_MAP[tabValue];
    if (!moduleKey) return false;
    
    return hasAccess(moduleKey);
  };

  return <TabsList className="grid w-full grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 h-auto p-2 bg-white">
      {isTabVisible('overview') && (
        <TabsTrigger value="overview" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <User className="h-4 w-4 text-primary" />
          <span>Übersicht</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('profile') && (
        <TabsTrigger value="profile" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <User className="h-4 w-4 text-primary" />
          <span>Profil</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('employment') && (
        <TabsTrigger value="employment" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Briefcase className="h-4 w-4 text-primary" />
          <span>Anstellung</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('documents') && (
        <TabsTrigger value="documents" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <FileText className="h-4 w-4 text-primary" />
          <span>Dokumente</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('salary') && (
        <TabsTrigger value="salary" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>Gehalt</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('time') && (
        <TabsTrigger value="time" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Clock className="h-4 w-4 text-primary" />
          <span>Zeit</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('vacation') && (
        <TabsTrigger value="vacation" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Plane className="h-4 w-4 text-primary" />
          <span>Urlaub</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('absence-history') && (
        <TabsTrigger value="absence-history" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Abwesenheiten</span>
        </TabsTrigger>
      )}

      {isTabVisible('work-analysis') && (
        <TabsTrigger value="work-analysis" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Arbeitszeiten</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('planning') && (
        <TabsTrigger value="planning" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Planung</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('career') && (
        <TabsTrigger value="career" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Karriere</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('onboarding') && (
        <TabsTrigger value="onboarding" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <UserPlus className="h-4 w-4 text-primary" />
          <span>Onboarding</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('feedback-360') && (
        <TabsTrigger value="feedback-360" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Users className="h-4 w-4 text-primary" />
          <span>360° Feedback</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('certificates') && (
        <TabsTrigger value="certificates" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Award className="h-4 w-4 text-primary" />
          <span>Zertifikate</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('hr-notes') && (
        <TabsTrigger value="hr-notes" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <FileEdit className="h-4 w-4 text-primary" />
          <span>HR-Notizen</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('tasks') && (
        <TabsTrigger value="tasks" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>Aufgaben</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('goals') && (
        <TabsTrigger value="goals" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Target className="h-4 w-4 text-primary" />
          <span>Ziele</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('training') && (
        <TabsTrigger value="training" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Training</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('projects') && (
        <TabsTrigger value="projects" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <FolderOpen className="h-4 w-4 text-primary" />
          <span>Projekte</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('expenses') && (
        <TabsTrigger value="expenses" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Receipt className="h-4 w-4 text-primary" />
          <span>Ausgaben</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('awards') && (
        <TabsTrigger value="awards" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Trophy className="h-4 w-4 text-primary" />
          <span>Auszeichnungen</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('benefits') && (
        <TabsTrigger value="benefits" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Gift className="h-4 w-4 text-primary" />
          <span>Benefits</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('health') && (
        <TabsTrigger value="health" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Activity className="h-4 w-4 text-primary" />
          <span>Gesundheit</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('remote-work') && (
        <TabsTrigger value="remote-work" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Wifi className="h-4 w-4 text-primary" />
          <span>Remote Work</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('communication') && (
        <TabsTrigger value="communication" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>Kommunikation</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('surveys') && (
        <TabsTrigger value="surveys" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <ClipboardList className="h-4 w-4 text-primary" />
          <span>Umfragen</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('roles') && (
        <TabsTrigger value="roles" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Shield className="h-4 w-4 text-primary" />
          <span>Rollen</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('notes') && (
        <TabsTrigger value="notes" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <StickyNote className="h-4 w-4 text-primary" />
          <span>Notizen</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('sustainability') && (
        <TabsTrigger value="sustainability" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Leaf className="h-4 w-4 text-primary" />
          <span>Nachhaltigkeit</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('sick-leave') && (
        <TabsTrigger value="sick-leave" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Heart className="h-4 w-4 text-primary" />
          <span>Krankmeldungen</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('shift-planning') && (
        <TabsTrigger value="shift-planning" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Schichtplanung</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('business-travel') && (
        <TabsTrigger value="business-travel" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Business Travel</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('compliance-hub') && (
        <TabsTrigger value="compliance-hub" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <span>Compliance Hub</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('miscellaneous') && (
        <TabsTrigger value="miscellaneous" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <MoreHorizontal className="h-4 w-4 text-primary" />
          <span>Verschiedenes</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('performance') && (
        <TabsTrigger value="performance" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Performance</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('skills') && (
        <TabsTrigger value="skills" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Star className="h-4 w-4 text-primary" />
          <span>Skills</span>
        </TabsTrigger>
      )}
      
      {isTabVisible('fleet') && (
        <TabsTrigger value="fleet" className="flex flex-col items-center gap-1 p-2 text-xs border border-primary/20 rounded-md bg-white hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 transition-all duration-200 min-h-[60px] justify-center">
          <Car className="h-4 w-4 text-primary" />
          <span>Fuhrpark</span>
        </TabsTrigger>
      )}
    </TabsList>;
};