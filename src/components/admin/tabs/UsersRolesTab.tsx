import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCog, ShieldCheck, Ban, Search, Filter, CheckCircle, Clock, Eye, Settings, Lock, MoreVertical, Info, Loader2 } from "lucide-react";
import { useAdminUsers, useAdminUsersStats } from "@/hooks/useAdminUsers";
import { useState } from "react";

const UsersRolesTab = () => {
  const { data: users, isLoading } = useAdminUsers();
  const { stats } = useAdminUsersStats();
  const [searchTerm, setSearchTerm] = useState("");

  const statsData = [
    { label: "Gesamt Nutzer", value: stats.total.toString(), icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Admins", value: stats.admins.toString(), icon: UserCog, color: "bg-gray-100 text-gray-900" },
    { label: "Mit 2FA", value: stats.withTwoFA.toString(), icon: ShieldCheck, color: "bg-green-50 text-green-600" },
    { label: "Gesperrte", value: stats.locked.toString(), icon: Ban, color: "bg-red-50 text-red-600" },
  ];

  const filteredUsers = (users || []).filter(user => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || user.email.toLowerCase().includes(search) || 
           (user.company_name || '').toLowerCase().includes(search);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Benutzer...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Nutzer & Rollen (mandantenübergreifend)</h2>
        <p className="text-sm text-muted-foreground">Übersicht über alle Benutzerkonten ohne Zugriff auf HR-Daten</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Nutzer suchen (Name, E-Mail oder Mandant)..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutzer</TableHead>
                <TableHead>Mandant</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Keine Nutzer gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.company_name || '-'}</p>
                        <p className="text-sm text-muted-foreground">{user.company_id?.slice(0, 8) || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" || user.role === "superadmin" ? "default" : "secondary"} 
                             className={user.role === "admin" || user.role === "superadmin" ? "bg-primary" : "bg-blue-100 text-blue-700"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={!user.is_locked ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>
                        {user.is_locked ? "Gesperrt" : "Aktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.last_login ? new Date(user.last_login).toLocaleString('de-DE') : '-'}
                    </TableCell>
                    <TableCell>
                      {user.two_factor_enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Lock className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Privacy by Design</p>
          <p className="text-sm text-blue-700">
            Diese Ansicht zeigt nur Kontoinformationen. HR-Daten sind strikt mandantenisoliert.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersRolesTab;