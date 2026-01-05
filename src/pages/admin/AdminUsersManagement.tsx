import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Trash2, Loader2 } from 'lucide-react';
import { CreateAdminDialog } from '@/components/admin/admin-users/CreateAdminDialog';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminUsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  // Echte Admin-Benutzer aus der Datenbank laden
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, company_id')
        .order('display_name');
      if (error) throw error;
      return data || [];
    }
  });

  const filteredAdmins = admins.filter(admin =>
    (admin.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (admin.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'TenantAdmin':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">TenantAdmin</Badge>;
      case 'SubAdmin':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">SubAdmin</Badge>;
      case 'BillingAdmin':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">BillingAdmin</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getPermissionsBadge = (permissions: string) => {
    switch (permissions) {
      case 'FullAccess':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">FullAccess</Badge>;
      case 'ReadWrite':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">ReadWrite</Badge>;
      default:
        return <Badge variant="secondary">{permissions}</Badge>;
    }
  };

  const handleDelete = (id: string) => {
    console.log('Delete admin:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin-Benutzerverwaltung</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Administratoren und deren Berechtigungen
          </p>
        </div>
        <Button 
          onClick={() => setOpenDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Admin hinzufügen
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Admin suchen (Name oder E-Mail)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Keine Benutzer vorhanden
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.display_name || '-'}</TableCell>
                  <TableCell>{admin.email || '-'}</TableCell>
                  <TableCell>{getRoleBadge(admin.role || 'User')}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-600 text-white">Aktiv</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(admin.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Admin Dialog */}
      <CreateAdminDialog 
        open={openDialog}
        onOpenChange={setOpenDialog}
      />
    </div>
  );
}
