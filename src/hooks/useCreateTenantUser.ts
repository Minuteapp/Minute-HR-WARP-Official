import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTenantUserParams {
  email: string;
  fullName: string;
  password: string;
  role: string;
  companyId: string;
  isTestUser?: boolean;
  department?: string;
  team?: string;
  position?: string;
}

interface CreateTenantUserResponse {
  success: boolean;
  userId: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
  isTestUser: boolean;
  message: string;
}

export const useCreateTenantUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTenantUserParams): Promise<CreateTenantUserResponse> => {
      const { email, fullName, password, role, companyId, isTestUser, department, team, position } = params;
      
      // Rufe Edge Function auf, die den User erstellt
      const { data, error } = await supabase.functions.invoke('create-tenant-user', {
        body: {
          email,
          fullName,
          password,
          role,
          companyId,
          isTestUser: isTestUser || false,
          department,
          team,
          position
        }
      });

      if (error) {
        throw new Error(error.message || 'Fehler beim Erstellen des Nutzers');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as CreateTenantUserResponse;
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Nutzer erfolgreich erstellt');
      queryClient.invalidateQueries({ queryKey: ['tenant-users', variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate') || error.message.includes('already') || error.message.includes('existiert')) {
        toast.error('Ein Nutzer mit dieser E-Mail existiert bereits');
      } else {
        toast.error(error.message || 'Fehler beim Erstellen des Nutzers');
      }
    }
  });
};
