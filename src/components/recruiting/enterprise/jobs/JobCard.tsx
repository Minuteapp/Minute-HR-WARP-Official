import { Card, CardContent } from '@/components/ui/card';
import JobStatusBadge from './JobStatusBadge';
import JobCardDetails from './JobCardDetails';
import JobApprovalHistory from './JobApprovalHistory';
import JobActionButtons from './JobActionButtons';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    status: string;
    department?: string;
    contract_type?: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    location?: string;
    employment_type?: string;
    created_at: string;
    approval_history?: Array<{
      approver_name: string;
      approver_role: string;
      status: string;
      approved_at: string;
    }>;
  };
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <Card className="border-l-4 border-l-primary border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
              <JobStatusBadge status={job.status} />
            </div>
            
            <JobCardDetails
              department={job.department}
              contractType={job.contract_type}
              salaryMin={job.salary_min}
              salaryMax={job.salary_max}
              currency={job.currency}
              location={job.location}
              employmentType={job.employment_type}
              createdAt={job.created_at}
            />
            
            <JobApprovalHistory approvalHistory={job.approval_history} />
          </div>
          
          <div className="ml-4">
            <JobActionButtons jobId={job.id} status={job.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
