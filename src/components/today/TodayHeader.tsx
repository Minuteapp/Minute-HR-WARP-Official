
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface TodayHeaderProps {
  user: User | null;
}

const TodayHeader = ({ user }: TodayHeaderProps) => {
  const [greeting, setGreeting] = useState('Guten Tag');
  const navigate = useNavigate();
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Guten Morgen');
    } else if (hour < 18) {
      setGreeting('Guten Tag');
    } else {
      setGreeting('Guten Abend');
    }
  }, []);

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Benutzer';
  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 w-full">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {firstName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Heute ist {today}
        </p>
      </div>
    </div>
  );
};

export default TodayHeader;
