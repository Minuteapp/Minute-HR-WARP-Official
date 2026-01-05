import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare, Inbox } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const FeedbackKudosWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: kudosData, isLoading } = useQuery({
    queryKey: ['employee-kudos', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return null;

      // Finde Employee-ID für den aktuellen User
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!employee) return null;

      const currentYear = new Date().getFullYear();

      // Lade Kudos-Summary
      const { data: summary } = await supabase
        .from('employee_kudos_summary')
        .select('kudos_received, kudos_given')
        .eq('employee_id', employee.id)
        .eq('year', currentYear)
        .maybeSingle();

      // Lade letztes erhaltenes Kudos
      const { data: lastKudos } = await supabase
        .from('employee_peer_kudos')
        .select('message, sent_date')
        .eq('receiver_employee_id', employee.id)
        .order('sent_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        kudosReceived: summary?.kudos_received || 0,
        kudosGiven: summary?.kudos_given || 0,
        lastFeedback: lastKudos?.message || null
      };
    },
    enabled: !!companyId
  });

  const kudosReceived = kudosData?.kudosReceived || 0;
  const kudosGiven = kudosData?.kudosGiven || 0;
  const lastFeedback = kudosData?.lastFeedback;
  const hasData = kudosReceived > 0 || kudosGiven > 0 || lastFeedback;

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          Feedback & Anerkennung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">Noch kein Feedback vorhanden</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-pink-600">{kudosReceived}</div>
                <p className="text-[10px] text-muted-foreground">Kudos erhalten</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-blue-600">{kudosGiven}</div>
                <p className="text-[10px] text-muted-foreground">Kudos gegeben</p>
              </div>
            </div>

            {lastFeedback && (
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Letztes Feedback</span>
                </div>
                <p className="text-xs italic line-clamp-2">"{lastFeedback}"</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
