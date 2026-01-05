
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/components/settings/users/types';
import { useAuth } from '@/contexts/AuthContext';

// Define the shape of a Supabase Auth user
interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    company_id?: string;
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
  last_sign_in_at?: string | null;
  created_at: string;
}

export const useUserData = (isAdmin: boolean) => {
  const { user: currentUser } = useAuth();
  
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', isAdmin],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      try {
        // Use secure RPC function instead of admin API
        const { data, error } = await supabase.rpc('get_company_users_secure');
        
        if (error) {
          throw error;
        }
        
        // Transform to User type
        const mappedUsers: User[] = (data || []).map((user: any): User => ({
          id: user.id,
          email: user.email,
          role: user.role || 'employee',
          created_at: user.created_at
        }));
        
        return mappedUsers;
      } catch (err) {
        // Return empty array instead of throwing to prevent query retries
        return [];
      }
    },
    enabled: isAdmin,
    retry: false
  });

  return {
    users,
    isLoading,
    error,
    refetch
  };
};
