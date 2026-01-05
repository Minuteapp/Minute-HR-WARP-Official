import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { useIsMobile } from "@/hooks/use-device-type";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmployeeNotFound from "./EmployeeNotFound";
import { EmployeeSubNavigation } from "./details/EmployeeSubNavigation";
import { MobileEmployeeHeader } from "./mobile/MobileEmployeeHeader";
import { MobileEmployeeProfileCard } from "./mobile/MobileEmployeeProfileCard";
import { MobileEmployeeTabNavigation } from "./mobile/MobileEmployeeTabNavigation";
import { MobileEmployeeTabGroups } from "./mobile/MobileEmployeeTabGroups";
import { MobileEmployeeAllTabsGrid } from "./mobile/MobileEmployeeAllTabsGrid";
import { MobileEmployeeContent } from "./mobile/MobileEmployeeContent";
import { OverviewTabContent } from "./details/OverviewTabContent";
import { ProfileTabContentWrapper } from "./details/ProfileTabContentWrapper";
import { CareerTab } from "./details/tabs/CareerTab";
import { OnboardingTab } from "./details/tabs/OnboardingTab";
import { OffboardingTab } from "./details/tabs/OffboardingTab";
import { FeedbackTab } from "./details/tabs/FeedbackTab";
import { CertificatesTab } from "./details/tabs/CertificatesTab";
import { HRNotesTab } from "./details/tabs/HRNotesTab";
import { NotesTab } from "./details/tabs/NotesTab";
import { BehaviorTab } from "./details/tabs/BehaviorTab";
import { HealthTab } from "./details/tabs/HealthTab";
import { PerformanceTab } from "./details/tabs/PerformanceTab";
import { EmploymentTab } from "./details/tabs/EmploymentTab";
import DocumentsTab from "./details/tabs/DocumentsTab";
import SalaryTab from "./details/tabs/SalaryTab";
import { VacationTab } from "./details/tabs/VacationTab";
import { AbsencesTab } from "./details/tabs/AbsencesTab";
import { PlanningTab } from "./details/tabs/PlanningTab";
import { ProjectsTab } from "./details/tabs/ProjectsTab";
import { TasksTab } from "./details/tabs/TasksTab";
import { GoalsTab } from "./details/tabs/GoalsTab";
import ExpensesTab from "./details/tabs/ExpensesTab";
import { CommunicationTab } from "./details/tabs/CommunicationTab";
import { SurveysTab } from "./details/tabs/SurveysTab";
import { SustainabilityTab } from "./details/tabs/SustainabilityTab";
import { SickLeaveTab } from "./details/tabs/SickLeaveTab";
import { InsuranceTab } from "./details/tabs/InsuranceTab";
import { BenefitsTab } from "./details/tabs/BenefitsTab";
import { RecognitionTab } from "./details/tabs/RecognitionTab";
import { RemoteWorkTab } from "./details/tabs/RemoteWorkTab";
import { RolesTab } from "./details/tabs/RolesTab";
import { PermissionsTab } from "./details/tabs/PermissionsTab";
import { NotificationsTab } from "./details/tabs/NotificationsTab";
import { EmployeeComplianceTabContent } from "./details/EmployeeComplianceTabContent";
import { EmployeeSkillsTabContent } from "./details/EmployeeSkillsTabContent";
import { EmployeeFleetTabContent } from "./details/EmployeeFleetTabContent";
import { EmployeeTrainingTabContent } from "./details/EmployeeTrainingTabContent";
import { EmployeeWorkTimeTabContent } from "./details/EmployeeWorkTimeTabContent";
import { EmployeeShiftPlanningTabContent } from "./details/EmployeeShiftPlanningTabContent";
import { EmployeeBusinessTravelTabContent } from "./details/EmployeeBusinessTravelTabContent";
import { EquipmentTab } from "./details/tabs/EquipmentTab";
import { ContractsTab } from "./details/tabs/ContractsTab";
import { TeamHistoryTab } from "./details/tabs/TeamHistoryTab";
import { WarningsTab } from "./details/tabs/WarningsTab";
import { ITAccessTab } from "./details/tabs/ITAccessTab";
import { 
  User, Briefcase, FileText, DollarSign, Plane, Clock, TrendingUp, 
  Target, CheckSquare, Receipt, MessageSquare, Shield, Leaf, Heart,
  Calendar, MapPin, AlertTriangle, Star, Car, GraduationCap, Settings,
  Building2, Mail, Sparkles, ArrowLeft, FolderOpen, LayoutGrid, 
  CheckCircle2, FileCheck, CalendarClock, BarChart3, Activity, ClipboardList, Edit, Save, X
} from "lucide-react";

interface EmployeeDetailsProps {
  employeeId: string;
}

const EmployeeDetails = ({ employeeId }: EmployeeDetailsProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { employee, isLoading, updateEmployee, isUpdating } = useEmployeeData(employeeId);
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'grid'>('list');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Prüfen ob es das eigene Profil ist
  useEffect(() => {
    const checkOwnProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id || !employeeId) {
        setIsOwnProfile(false);
        return;
      }
      
      // Prüfen ob der aktuelle User dieser Mitarbeiter ist
      const { data: empData } = await supabase
        .from('employees')
        .select('user_id')
        .eq('id', employeeId)
        .maybeSingle();
      
      setIsOwnProfile(empData?.user_id === user.id);
    };
    
    checkOwnProfile();
  }, [employeeId]);
  
  // Globaler Bearbeitungsmodus
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const handleStartEditing = () => {
    setIsEditing(true);
    setPendingChanges({});
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setPendingChanges({});
  };

  const handleFieldChange = (tab: string, field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [tab]: {
        ...(prev[tab] || {}),
        [field]: value
      }
    }));
  };

  // Mapping von UI-Feldnamen zu Datenbank-Feldnamen
  const fieldMapping: Record<string, string> = {
    'personalInfo.firstName': 'first_name',
    'personalInfo.lastName': 'last_name',
    'personalInfo.email': 'email',
    'personalInfo.phone': 'phone',
    'personalInfo.mobilePhone': 'mobile_phone',
    'personalInfo.birthDate': 'birth_date',
    'personalInfo.nationality': 'nationality',
    'personalInfo.secondNationality': 'second_nationality',
    'personalInfo.gender': 'gender',
    'personalInfo.address.street': 'street',
    'personalInfo.address.postalCode': 'postal_code',
    'personalInfo.address.city': 'city',
    'personalInfo.address.country': 'country',
    'employmentInfo.position': 'position',
    'employmentInfo.department': 'department',
    'employmentInfo.team': 'team',
    'employmentInfo.startDate': 'start_date',
    'employmentInfo.workingHours': 'working_hours',
    'employmentInfo.vacationDays': 'vacation_days',
    'employmentInfo.workStartTime': 'work_start_time',
    'employmentInfo.workEndTime': 'work_end_time',
    'employmentInfo.lunchBreakStart': 'lunch_break_start',
    'employmentInfo.lunchBreakEnd': 'lunch_break_end',
    'employmentInfo.taxId': 'tax_id',
    'employmentInfo.socialSecurityNumber': 'social_security_number',
    'employmentInfo.managerId': 'manager_id',
    'employmentInfo.costCenter': 'cost_center',
    'employmentInfo.taxClass': 'tax_class',
    'employmentInfo.healthInsurance': 'health_insurance',
    'employmentInfo.iban': 'iban',
    'employmentInfo.bic': 'bic',
    'employmentInfo.bankName': 'bank_name',
    'emergencyContact.name': 'emergency_contact_name',
    'emergencyContact.phone': 'emergency_contact_phone',
    'emergencyContact.relation': 'emergency_contact_relationship',
    // Direkte Felder
    'first_name': 'first_name',
    'last_name': 'last_name',
    'email': 'email',
    'phone': 'phone',
    'position': 'position',
    'department': 'department',
    'status': 'status',
  };

  // Nur diese Tabs enthalten Felder, die in der employees-Tabelle gespeichert werden
  const employeeTableTabs = ['profile', 'employment', 'salary'];
  
  // Felder die NICHT in employees gespeichert werden (gehören zu anderen Tabellen)
  const excludedFields = [
    'retention_risk', 'flight_risk', 'potential', 'performance_score',
    'brutto', 'netto', 'bonus', 'allowances',
    'career_goals', 'development_areas', 'strengths',
  ];

  const handleSaveAll = async () => {
    try {
      // Nur Änderungen aus erlaubten Tabs sammeln, die zu employees gehören
      const flattenedChanges: Record<string, any> = {};
      
      Object.entries(pendingChanges).forEach(([tab, tabChanges]) => {
        // Nur Tabs verarbeiten, die employees-Felder enthalten
        if (!employeeTableTabs.includes(tab)) return;
        
        if (typeof tabChanges === 'object' && tabChanges !== null) {
          Object.entries(tabChanges as Record<string, any>).forEach(([field, value]) => {
            // Ausgeschlossene Felder überspringen
            if (excludedFields.includes(field)) return;
            
            // Prüfen ob Mapping existiert
            const dbField = fieldMapping[field] || field;
            
            // Nur bekannte employees-Felder akzeptieren
            if (fieldMapping[field] || Object.values(fieldMapping).includes(field)) {
              flattenedChanges[dbField] = value;
            }
          });
        }
      });

      if (Object.keys(flattenedChanges).length === 0) {
        toast.info('Keine Änderungen zum Speichern');
        setIsEditing(false);
        return;
      }

      console.log('Speichere Änderungen (gemappt):', flattenedChanges);
      updateEmployee(flattenedChanges);
      setIsEditing(false);
      setPendingChanges({});
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  if (!employee) {
    return <EmployeeNotFound />;
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileEmployeeHeader employee={employee} />
        <div className="p-4 space-y-4">
          <MobileEmployeeProfileCard employee={employee} />
          <MobileEmployeeTabNavigation 
            viewMode={mobileViewMode}
            onViewModeChange={setMobileViewMode}
          />
          {mobileViewMode === 'list' ? (
            <MobileEmployeeTabGroups 
              employeeId={employeeId} 
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : (
            <MobileEmployeeAllTabsGrid 
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
          )}
          <MobileEmployeeContent employee={employee} employeeId={employeeId} />
        </div>
      </div>
    );
  }

  const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

  // Desktop view
  return (
    <div className="min-h-screen bg-white p-6 space-y-6">
      {/* Header - Redesigned */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/employees')}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Liste
          </Button>
          <h1 className="text-2xl font-semibold">Mitarbeiter-Profil</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCancelEditing}>
                <X className="w-4 h-4" />
                Abbrechen
              </Button>
              <Button 
                size="sm" 
                className="gap-2 bg-green-600 hover:bg-green-700" 
                onClick={handleSaveAll}
                disabled={isUpdating}
              >
                <Save className="w-4 h-4" />
                {isUpdating ? 'Speichert...' : 'Speichern'}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleStartEditing}>
              <Edit className="w-4 h-4" />
              Profil bearbeiten
            </Button>
          )}
        </div>
      </div>

      {/* Profile Section - Redesigned */}
      <Card className="p-6 border-border shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-gray-700 text-white text-xs px-2 py-0.5 border-0">
                  Vorschau
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{employee.first_name} {employee.last_name}</h2>
                <Badge variant="outline" className={employee.status === 'active' ? 'text-green-600 border-green-600' : 'text-gray-500 border-gray-500'}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-8 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Position</span>
            </div>
            <p className="font-medium">{employee.position || 'Nicht angegeben'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <LayoutGrid className="w-4 h-4" />
              <span>Abteilung</span>
            </div>
            <p className="font-medium">{employee.department || 'Nicht zugewiesen'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Mail className="w-4 h-4" />
              <span>E-Mail</span>
            </div>
            <p className="font-medium">{employee.email || '-'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span>Standort</span>
            </div>
            <p className="font-medium">{employee.location || '-'}</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>Zuletzt aktiv: {new Date().toLocaleDateString('de-DE')}</span>
          <span>Mitarbeiter-ID: {employee.employee_number || '-'}</span>
        </div>
      </Card>

      {/* Sub-Navigation */}
      <EmployeeSubNavigation currentTab={currentTab} onTabChange={setCurrentTab} isOwnProfile={isOwnProfile} />

      {/* Navigation Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        {/* Overview Content */}
        <TabsContent value="overview">
          <OverviewTabContent employeeId={employeeId} />
        </TabsContent>

        {/* Tab Contents - mit globalem Bearbeitungsmodus */}
        <TabsContent value="profile">
          <ProfileTabContentWrapper 
            employeeId={employeeId} 
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
            pendingChanges={pendingChanges}
          />
        </TabsContent>

        <TabsContent value="employment">
          <EmploymentTab employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="salary">
          <SalaryTab employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="vacation">
          <VacationTab employee={employee} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="absences">
          <AbsencesTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="time">
          <EmployeeWorkTimeTabContent employeeId={employeeId} />
        </TabsContent>

        {/* Alias für TabNavigation */}
        <TabsContent value="work-analysis">
          <EmployeeWorkTimeTabContent employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="planning">
          <PlanningTab employee={employee} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTab employeeId={employee.id} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationTab employee={employee} />
        </TabsContent>

        <TabsContent value="surveys">
          <SurveysTab employee={employee} />
        </TabsContent>

        <TabsContent value="sustainability">
          <SustainabilityTab employee={employee} />
        </TabsContent>

        <TabsContent value="sick">
          <SickLeaveTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value="shifts">
          <EmployeeShiftPlanningTabContent employeeId={employeeId} />
        </TabsContent>

        {/* Alias für TabNavigation */}
        <TabsContent value="shift-planning">
          <EmployeeShiftPlanningTabContent employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="travel">
          <EmployeeBusinessTravelTabContent employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="compliance">
          <EmployeeComplianceTabContent employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="skills">
          <EmployeeSkillsTabContent employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="fleet">
          <EmployeeFleetTabContent employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="training">
          <EmployeeTrainingTabContent employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="career">
          <CareerTab employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="onboarding">
          <OnboardingTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="offboarding">
          <OffboardingTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackTab employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificatesTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="hr-notes">
          <HRNotesTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="notes">
          <NotesTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorTab employeeId={employeeId} isEditing={isEditing} onFieldChange={handleFieldChange} pendingChanges={pendingChanges} />
        </TabsContent>

        <TabsContent value="health">
          <HealthTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="insurance">
          <InsuranceTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="awards">
          <RecognitionTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="remote-work">
          <RemoteWorkTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="equipment">
          <EquipmentTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="team-history">
          <TeamHistoryTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="warnings">
          <WarningsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value="it-access">
          <ITAccessTab employeeId={employeeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetails;