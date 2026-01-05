import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Plus,
  FileText,
  TrendingUp,
  Edit,
  Download,
} from 'lucide-react';
import { usePayrollData } from '@/hooks/usePayrollData';

interface EmployeeManagementProps {
  userRole: 'admin' | 'hr-manager' | 'supervisor' | 'employee';
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ userRole }) => {
  const { payslips, contracts, isLoading } = usePayrollData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const canManageEmployees = userRole === 'admin' || userRole === 'hr-manager';

  // Erstelle eine aggregierte Ansicht der Mitarbeiter
  const employees = contracts?.map(contract => {
    const employeePayslips = payslips?.filter(p => p.user_id === contract.user_id) || [];
    const latestPayslip = employeePayslips.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      id: contract.user_id,
      contractId: contract.id,
      contractType: contract.contract_type,
      baseSalary: contract.base_salary || 0,
      hourlyRate: contract.hourly_rate,
      isActive: contract.is_active,
      validFrom: contract.valid_from,
      validUntil: contract.valid_until,
      latestSalary: latestPayslip?.gross_salary || 0,
      payslipCount: employeePayslips.length,
    };
  }) || [];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && emp.isActive) ||
      (filterStatus === 'inactive' && !emp.isActive);
    return matchesSearch && matchesStatus;
  });

  const getContractTypeBadge = (type: string) => {
    const config = {
      'full_time': { label: 'Vollzeit', variant: 'default' as const },
      'part_time': { label: 'Teilzeit', variant: 'secondary' as const },
      'mini_job': { label: 'Minijob', variant: 'outline' as const },
      'freelance': { label: 'Freiberufler', variant: 'outline' as const },
    };
    return config[type as keyof typeof config] || { label: type, variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Mitarbeiterverwaltung</h2>
          <p className="text-muted-foreground">
            Verträge und Gehaltshistorie verwalten
          </p>
        </div>
        {canManageEmployees && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neuer Vertrag
          </Button>
        )}
      </div>

      {/* Statistiken */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {employees.length} gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittsgehalt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(employees.reduce((sum, e) => sum + e.baseSalary, 0) / employees.length || 0)
                .toLocaleString('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                })}
            </div>
            <p className="text-xs text-muted-foreground">
              Brutto monatlich
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vertragsarten</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(employees.map(e => e.contractType)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Typen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Suche */}
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiterliste</CardTitle>
          <CardDescription>
            Übersicht aller Verträge und Gehaltsabrechnungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mitarbeiter suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
            {canManageEmployees && (
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>

          {/* Tabelle */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter-ID</TableHead>
                  <TableHead>Vertragsart</TableHead>
                  <TableHead>Grundgehalt</TableHead>
                  <TableHead>Letztes Gehalt</TableHead>
                  <TableHead>Abrechnungen</TableHead>
                  <TableHead>Status</TableHead>
                  {canManageEmployees && <TableHead>Aktionen</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageEmployees ? 7 : 6} className="text-center py-8">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Keine Mitarbeiter gefunden</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => {
                    const contractBadge = getContractTypeBadge(employee.contractType);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={contractBadge.variant}>
                            {contractBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {employee.baseSalary.toLocaleString('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </TableCell>
                        <TableCell>
                          {employee.latestSalary > 0
                            ? employee.latestSalary.toLocaleString('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell>{employee.payslipCount}</TableCell>
                        <TableCell>
                          <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                            {employee.isActive ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </TableCell>
                        {canManageEmployees && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
