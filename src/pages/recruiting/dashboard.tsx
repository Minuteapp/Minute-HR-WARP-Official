
import { Card } from "@/components/ui/card";
import RecruitingDashboard from "@/components/recruiting/RecruitingDashboard";
import JobList from "@/components/recruiting/JobList";
import CandidateList from "@/components/recruiting/CandidateList";
import RecruitingNotifications from "@/components/recruiting/RecruitingNotifications";
import { NotificationProvider } from "@/contexts/NotificationContext";

const RecruitingDashboardPage = () => {
  return (
    <NotificationProvider>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Recruiting Dashboard</h1>
        <RecruitingDashboard />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Neueste Stellenanzeigen</h2>
              <JobList limit={3} />
            </Card>
            
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Aktuelle Bewerbungen</h2>
              <CandidateList limit={3} />
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="p-6">
              <RecruitingNotifications />
            </Card>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default RecruitingDashboardPage;
