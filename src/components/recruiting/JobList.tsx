
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, MoreVertical, Users } from 'lucide-react';

interface JobListProps {
  limit?: number;
  filters?: {
    search?: string;
    department?: string;
    location?: string;
    status?: string;
  };
  onSuccess?: () => void;
}

const JobList = ({ limit, filters, onSuccess }: JobListProps) => {
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Berlin",
      type: "Vollzeit",
      applications: 8,
      status: "Aktiv"
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "München",
      type: "Vollzeit",
      applications: 12,
      status: "Aktiv"
    },
    {
      id: 3,
      title: "HR Manager",
      department: "Human Resources",
      location: "Hamburg",
      type: "Vollzeit",
      applications: 5,
      status: "Review"
    }
  ];

  let filteredJobs = jobs;

  if (filters) {
    filteredJobs = jobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesDepartment = !filters.department || filters.department === 'all' || 
        job.department === filters.department;
      
      const matchesLocation = !filters.location || filters.location === 'all' || 
        job.location === filters.location;
      
      const matchesStatus = !filters.status || filters.status === 'all' || 
        job.status === filters.status;

      return matchesSearch && matchesDepartment && matchesLocation && matchesStatus;
    });
  }

  if (limit) {
    filteredJobs = filteredJobs.slice(0, limit);
  }

  return (
    <div className="space-y-4">
      {filteredJobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{job.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{job.department}</span>
                  <span className="mx-2">•</span>
                  <span>{job.location}</span>
                  <span className="mx-2">•</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {job.applications} Bewerbungen
                  </span>
                </div>
                <Badge variant={job.status === "Aktiv" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobList;
