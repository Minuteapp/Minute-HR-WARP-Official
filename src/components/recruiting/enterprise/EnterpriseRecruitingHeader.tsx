import { Briefcase } from 'lucide-react';

const EnterpriseRecruitingHeader = () => {
  return (
    <div className="flex justify-between items-start border-b pb-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Recruiting</h1>
          <p className="text-sm text-muted-foreground">Globales Talent-Acquisition-System</p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseRecruitingHeader;
