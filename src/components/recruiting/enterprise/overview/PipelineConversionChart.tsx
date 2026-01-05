import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { Skeleton } from '@/components/ui/skeleton';

const PipelineConversionChart = () => {
  const { currentCompany } = useCompany();

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['recruiting-pipeline', currentCompany?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('status');
      
      if (error) throw error;
      
      const statusCounts = {
        'Eingegangen': 0,
        'Screening': 0,
        'Interview': 0,
        'Angebot': 0,
        'Eingestellt': 0,
      };
      
      (data || []).forEach((app) => {
        switch (app.status) {
          case 'new':
          case 'pending':
            statusCounts['Eingegangen']++;
            break;
          case 'screening':
          case 'in_review':
            statusCounts['Screening']++;
            break;
          case 'interview':
          case 'interviewed':
            statusCounts['Interview']++;
            break;
          case 'offered':
          case 'offer_declined':
            statusCounts['Angebot']++;
            break;
          case 'hired':
            statusCounts['Eingestellt']++;
            break;
        }
      });
      
      return Object.entries(statusCounts).map(([name, count]) => ({
        name,
        count,
      }));
    },
    enabled: !!currentCompany?.id,
  });

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Pipeline-Conversion</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineConversionChart;
