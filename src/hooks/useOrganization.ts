import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Department, Position, DepartmentFormData, PositionFormData } from '@/types/sprint1.types';
import { useToast } from '@/hooks/use-toast';

// Departments Hook
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: DepartmentFormData) => {
      const { data: department, error } = await supabase
        .from('departments')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Abteilung erstellt',
        description: 'Die Abteilung wurde erfolgreich erstellt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Die Abteilung konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      console.error('Create department error:', error);
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DepartmentFormData> }) => {
      const { data: department, error } = await supabase
        .from('departments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Abteilung aktualisiert',
        description: 'Die Abteilung wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Die Abteilung konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      console.error('Update department error:', error);
    },
  });
};

// Positions Hook
export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('positions')
        .select(`
          *,
          department:departments(name),
          reports_to:positions!reports_to_position_id(title)
        `)
        .eq('is_active', true)
        .order('title');
      
      if (error) throw error;
      return data as Position[];
    },
  });
};

export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PositionFormData) => {
      const { data: position, error } = await supabase
        .from('positions')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return position;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast({
        title: 'Position erstellt',
        description: 'Die Position wurde erfolgreich erstellt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Die Position konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      console.error('Create position error:', error);
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PositionFormData> }) => {
      const { data: position, error } = await supabase
        .from('positions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return position;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast({
        title: 'Position aktualisiert',
        description: 'Die Position wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Die Position konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      console.error('Update position error:', error);
    },
  });
};

// Organization Hierarchy Helper
export const useOrganizationHierarchy = () => {
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();

  return useQuery({
    queryKey: ['organization-hierarchy', departments, positions],
    queryFn: () => {
      if (!departments || !positions) return null;

      // Build department hierarchy
      const departmentMap = new Map();
      const departmentHierarchy: any[] = [];

      departments.forEach(dept => {
        departmentMap.set(dept.id, { ...dept, children: [], positions: [] });
      });

      departments.forEach(dept => {
        if (dept.parent_id && departmentMap.has(dept.parent_id)) {
          departmentMap.get(dept.parent_id).children.push(departmentMap.get(dept.id));
        } else {
          departmentHierarchy.push(departmentMap.get(dept.id));
        }
      });

      // Add positions to departments
      positions.forEach(pos => {
        if (pos.department_id && departmentMap.has(pos.department_id)) {
          departmentMap.get(pos.department_id).positions.push(pos);
        }
      });

      return departmentHierarchy;
    },
    enabled: !!departments && !!positions,
  });
};