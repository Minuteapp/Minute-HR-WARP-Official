import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportCard } from './ReportCard';
import { Skeleton } from '@/components/ui/skeleton';

export const AvailableReports: React.FC = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['budget-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_reports')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Verfügbare Berichte
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                reportName={report.report_name}
                reportType={report.report_type}
                description={report.description || ''}
                fileType={report.file_type || 'pdf'}
                fileSize={report.file_size || '0 KB'}
                createdDate={report.created_date || report.created_at || new Date().toISOString()}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Keine Berichte verfügbar.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
