import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, UserCog } from 'lucide-react';
import { CompanyAdmin } from '../../types';
import { AdminEmptyState } from './AdminEmptyState';

interface AdminListProps {
  companyAdmins: CompanyAdmin[];
  onAddAdmin: () => void;
  onResendInvitation: (email: string) => void;
  onEditAdmin?: (admin: CompanyAdmin) => void;
  onDeleteAdmin?: (adminId: string, adminEmail: string) => Promise<void>;
  handleSendInvitation: (email: string) => void;
  handleDeleteAdmin: (id: string, email: string) => void;
}

export const AdminList: React.FC<AdminListProps> = ({
  companyAdmins,
  onAddAdmin,
  handleSendInvitation,
}) => {
  if (!companyAdmins || companyAdmins.length === 0) {
    return <AdminEmptyState onAddAdmin={onAddAdmin} />;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'TenantAdmin':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">TenantAdmin</Badge>;
      case 'SubAdmin':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">SubAdmin</Badge>;
      case 'BillingAdmin':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">BillingAdmin</Badge>;
      default:
        return <Badge variant="secondary">{role || '-'}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Letzter Login</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companyAdmins.map((admin) => {
            return (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.full_name || admin.email}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.phone || '-'}</TableCell>
                <TableCell>{getRoleBadge(admin.role || '')}</TableCell>
                <TableCell>
                  <Badge className={admin.status === 'active' ? "bg-black text-white hover:bg-black/90" : "bg-gray-200 text-gray-700"}>
                    {admin.status === 'active' ? 'Active' : admin.status || 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendInvitation(admin.email)}
                      className="gap-1 text-sm"
                    >
                      <Key className="h-3 w-3" />
                      Zugangsdaten
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <UserCog className="h-3 w-3" />
                      Als Admin anmelden
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
