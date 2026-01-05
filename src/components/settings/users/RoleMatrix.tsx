
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

// Typen für die Berechtigungsmatrix
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const RoleMatrix = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Rollen und Berechtigungen werden aus der DB geladen
  // TODO: Echte Daten aus company_roles und Berechtigungstabellen laden
  useEffect(() => {
    console.log("Loading role matrix data");
    // Leere Arrays als Ausgangszustand - werden aus der DB gefüllt
    setRoles([]);
    setPermissions([]);
    setLoading(false);
  }, []);

  // Gruppiere Berechtigungen nach Kategorie
  const permissionCategories = ['all', ...Array.from(new Set(permissions.map(p => p.category)))];
  
  // Filtere Berechtigungen basierend auf der ausgewählten Kategorie
  const filteredPermissions = selectedCategory === 'all' 
    ? permissions 
    : permissions.filter(p => p.category === selectedCategory);

  // Prüfe, ob eine Rolle eine bestimmte Berechtigung hat
  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions.includes(permissionId);
  };

  // Toggle-Funktion für Berechtigungen
  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === roleId) {
          const updatedPermissions = role.permissions.includes(permissionId)
            ? role.permissions.filter(id => id !== permissionId)
            : [...role.permissions, permissionId];
          
          return { ...role, permissions: updatedPermissions };
        }
        return role;
      })
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Berechtigungsmatrix
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                {permissionCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Alle Kategorien' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Änderungen speichern
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Lade Rollenmatrix...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Berechtigungen</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                        <Checkbox
                          checked={hasPermission(role, permission.id)}
                          onCheckedChange={() => togglePermission(role.id, permission.id)}
                          aria-label={`${role.name} ${permission.name} Berechtigung`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleMatrix;
