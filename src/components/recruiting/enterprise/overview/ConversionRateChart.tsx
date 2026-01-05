import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { Skeleton } from '@/components/ui/skeleton';

const ConversionRateChart = () => {
  const { currentCompany } = useCompany();

  const { data: conversionData, isLoading } = useQuery({
    queryKey: ['recruiting-conversion-rate', currentCompany?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('status');
      
      if (error) throw error;
      
      const total = data?.length || 0;
      if (total === 0) {
        return [
          { stage: 'Eingegangen', rate: 0 },
          { stage: 'Screening', rate: 0 },
          { stage: 'Interview', rate: 0 },
          { stage: 'Angebot', rate: 0 },
          { stage: 'Eingestellt', rate: 0 },
        ];
      }
      
      const statusOrder = ['new', 'pending', 'screening', 'in_review', 'interview', 'interviewed', 'offered', 'hired'];
      
      const getStageCount = (minStatuses: string[]) => {
        return (data || []).filter(app => 
          statusOrder.indexOf(app.status) >= statusOrder.indexOf(minStatuses[0])
        ).length;
      };
      
      const incoming = total;
      const screening = (data || []).filter(app => 
        ['screening', 'in_review', 'interview', 'interviewed', 'offered', 'hired'].includes(app.status)
      ).length;
      const interview = (data || []).filter(app => 
        ['interview', 'interviewed', 'offered', 'hired'].includes(app.status)
      ).length;
      const offered = (data || []).filter(app => 
        ['offered', 'offer_declined', 'hired'].includes(app.status)
      ).length;
      const hired = (data || []).filter(app => app.status === 'hired').length;
      
      return [
        { stage: 'Eingegangen', rate: 100 },
        { stage: 'Screening', rate: Math.round((screening / total) * 100) },
        { stage: 'Interview', rate: Math.round((interview / total) * 100) },
        { stage: 'Angebot', rate: Math.round((offered / total) * 100) },
        { stage: 'Eingestellt', rate: Math.round((hired / total) * 100) },
      ];
    },
    enabled: !!currentCompany?.id,
  });

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Conversion Rate (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={conversionData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="stage" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [`${value}%`, 'Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionRateChart;
