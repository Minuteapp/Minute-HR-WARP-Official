
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecruitingGeneralSettings from "./components/RecruitingGeneralSettings";
import JobPostingSettings from "./components/JobPostingSettings";
import ApplicationProcessSettings from "./components/ApplicationProcessSettings";
import CandidateManagementSettings from "./components/CandidateManagementSettings";
import RecruitingApprovalWorkflows from "./components/RecruitingApprovalWorkflows";
import RecruitingIntegrations from "./components/RecruitingIntegrations";
import RecruitingNotifications from "./components/RecruitingNotifications";
import RecruitingRoleVisibility from "./components/RecruitingRoleVisibility";

export default function RecruitingSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Recruiting & Bewerbermanagement</h1>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="job-postings">Stellenanzeigen</TabsTrigger>
            <TabsTrigger value="application-process">Bewerbungsprozess</TabsTrigger>
            <TabsTrigger value="candidate-management">Kandidatenmanagement</TabsTrigger>
            <TabsTrigger value="approval-workflows">Genehmigungsworkflows</TabsTrigger>
            <TabsTrigger value="integrations">Integrationen</TabsTrigger>
            <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
            <TabsTrigger value="role-visibility">Sichtbarkeit & Rollen</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 px-6 pb-6">
            <TabsContent value="general" className="mt-0">
              <RecruitingGeneralSettings />
            </TabsContent>
            
            <TabsContent value="job-postings" className="mt-0">
              <JobPostingSettings />
            </TabsContent>
            
            <TabsContent value="application-process" className="mt-0">
              <ApplicationProcessSettings />
            </TabsContent>
            
            <TabsContent value="candidate-management" className="mt-0">
              <CandidateManagementSettings />
            </TabsContent>
            
            <TabsContent value="approval-workflows" className="mt-0">
              <RecruitingApprovalWorkflows />
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-0">
              <RecruitingIntegrations />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <RecruitingNotifications />
            </TabsContent>
            
            <TabsContent value="role-visibility" className="mt-0">
              <RecruitingRoleVisibility />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
