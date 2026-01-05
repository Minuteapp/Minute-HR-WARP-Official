import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const EmployeeWidget = () => {
  const navigate = useNavigate();
  const { tenantCompany } = useTenant();

  const { data: employees = [] } = useQuery({
    queryKey: ['active-employees-dashboard', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, position, last_active')
        .eq('company_id', tenantCompany.id)
        .eq('status', 'active')
        .eq('archived', false)
        .order('last_active', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Error fetching employees:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => navigate('/employees')}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Team Status</h2>
        <Users size={20} className="text-primary" />
      </div>
      <div className="space-y-3">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/employees/profile/${employee.id}`);
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white">
                  {employee.name?.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">{employee.name}</p>
                  <p className="text-xs text-gray-500">{employee.position}</p>
                </div>
              </div>
              <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                online
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            Keine aktiven Mitarbeiter
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeWidget;
