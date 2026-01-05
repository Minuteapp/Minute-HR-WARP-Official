import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface SystemRoleCardProps {
  systemRole?: {
    role: string;
    company_id: string;
  } | null;
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    superadmin: 'SuperAdmin',
    admin: 'Administrator',
    hr: 'HR-Manager',
    hr_manager: 'HR-Manager',
    manager: 'Manager',
    employee: 'Mitarbeiter',
  };
  return labels[role.toLowerCase()] || role;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    superadmin: 'destructive',
    admin: 'destructive',
    hr: 'default',
    hr_manager: 'default',
    manager: 'default',
    employee: 'secondary',
  };
  return colors[role.toLowerCase()] || 'secondary';
};

const getRoleDescription = (role: string) => {
  const descriptions: Record<string, string> = {
    superadmin: 'Sie haben uneingeschränkten Zugriff auf alle Systembereiche und Unternehmen',
    admin: 'Sie haben uneingeschränkten Zugriff auf alle Systembereiche',
    hr: 'Sie haben erweiterten Zugriff auf HR-relevante Bereiche',
    hr_manager: 'Sie haben erweiterten Zugriff auf HR-relevante Bereiche',
    manager: 'Sie haben erweiterten Zugriff auf Team-relevante Bereiche',
    employee: 'Sie haben Zugriff auf Ihre persönlichen Bereiche',
  };
  return descriptions[role.toLowerCase()] || 'Standard-Zugriffsrechte';
};

export const SystemRoleCard = ({ systemRole }: SystemRoleCardProps) => {
  const role = systemRole?.role || 'employee';

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Ihre aktuelle Rolle im System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">{getRoleLabel(role)}</h3>
              <Badge variant={getRoleColor(role) as any}>Aktiv</Badge>
            </div>
            <p className="text-muted-foreground">{getRoleDescription(role)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
