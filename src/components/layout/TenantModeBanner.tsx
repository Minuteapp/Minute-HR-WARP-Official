import { useTenant } from '@/contexts/TenantContext';
import { useTenantContext } from '@/hooks/useTenantContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Banner der anzeigt wenn SuperAdmin im Tenant-Modus ist
 */
export const TenantModeBanner = () => {
  const { tenantCompany, isSuperAdmin, refetchTenant } = useTenant();
  const { clearTenantContext } = useTenantContext();
  const navigate = useNavigate();

  // Zeige Banner wenn wir im Tenant-Modus sind (tenantCompany existiert)
  // UND der User eigentlich ein SuperAdmin ist
  if (!tenantCompany) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-blue-600">
            <Building2 className="h-3 w-3 mr-1" />
            Tenant-Modus
          </Badge>
          <span className="text-sm font-medium text-blue-900">
            Sie arbeiten in: <strong>{tenantCompany.name}</strong>
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await clearTenantContext();
            refetchTenant();
            navigate('/admin');
          }}
          className="text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Admin-Bereich
        </Button>
      </div>
    </div>
  );
};
