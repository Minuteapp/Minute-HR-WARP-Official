import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface GDPRSetting {
  id: string;
  country_code: string;
  retention_days: number;
  consent_required: boolean;
}

const GDPRCountrySettings = () => {
  const { tenantCompany } = useTenant();

  const { data: settings = [] } = useQuery({
    queryKey: ['gdpr-country-settings', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('gdpr_country_settings')
        .select('*')
        .eq('company_id', tenantCompany.id)
        .order('country_code');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'DE': 'Deutschland',
      'AT': 'Österreich',
      'CH': 'Schweiz',
      'EU': 'EU (Standard)',
      'US': 'USA',
      'UK': 'Großbritannien',
      'DEFAULT': 'Standard'
    };
    return countries[code] || code;
  };

  // Default settings if none exist
  const defaultSettings: GDPRSetting[] = [
    { id: '1', country_code: 'DE', retention_days: 180, consent_required: true },
    { id: '2', country_code: 'EU', retention_days: 180, consent_required: true },
    { id: '3', country_code: 'US', retention_days: 365, consent_required: false },
    { id: '4', country_code: 'DEFAULT', retention_days: 180, consent_required: true }
  ];

  const displaySettings = settings.length > 0 ? settings : defaultSettings;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">DSGVO-Einstellungen nach Land</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Land</TableHead>
              <TableHead>Aufbewahrungsfrist</TableHead>
              <TableHead>Einwilligung erforderlich</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displaySettings.map((setting: GDPRSetting) => (
              <TableRow key={setting.id}>
                <TableCell className="font-medium">
                  {getCountryName(setting.country_code)}
                </TableCell>
                <TableCell>{setting.retention_days} Tage</TableCell>
                <TableCell>
                  {setting.consent_required ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" /> Ja
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <X className="h-4 w-4" /> Nein
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GDPRCountrySettings;
