import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  MapPin, 
  Briefcase, 
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Settings
} from 'lucide-react';
import { useOrganizationalStructure } from '@/hooks/useOrganizationalStructure';
import { OrganizationalUnitDialog } from './OrganizationalUnitDialog';
import { OrganizationalRoleDialog } from './OrganizationalRoleDialog';
import { OrganizationalHierarchyTree } from './OrganizationalHierarchyTree';
import { OrganizationalRolesTable } from './OrganizationalRolesTable';
import type { OrganizationalUnit, OrganizationalUnitType } from '@/types/organizational-structure';

const getTypeIcon = (type: OrganizationalUnitType) => {
  switch (type) {
    case 'area':
      return <Building2 className="h-4 w-4" />;
    case 'department':
      return <Briefcase className="h-4 w-4" />;
    case 'team':
      return <Users className="h-4 w-4" />;
    case 'location':
      return <MapPin className="h-4 w-4" />;
    case 'subsidiary':
      return <Building2 className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: OrganizationalUnitType) => {
  switch (type) {
    case 'area':
      return 'Bereich';
    case 'department':
      return 'Abteilung';
    case 'team':
      return 'Team';
    case 'location':
      return 'Standort';
    case 'subsidiary':
      return 'Tochterunternehmen';
    default:
      return type;
  }
};

export const OrganizationalStructureManagement: React.FC = () => {
  const {
    units,
    roles,
    hierarchy,
    loading,
    createUnit,
    updateUnit,
    deactivateUnit,
    createRole,
    updateRole,
    deactivateRole
  } = useOrganizationalStructure();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (unit: OrganizationalUnit) => {
    setEditingUnit(unit);
    setUnitDialogOpen(true);
  };

  const handleDeleteUnit = async (unit: OrganizationalUnit) => {
    if (confirm(`Möchten Sie die Organisationseinheit "${unit.name}" wirklich deaktivieren?`)) {
      await deactivateUnit(unit.id);
    }
  };

  const handleCreateRole = (unit?: OrganizationalUnit) => {
    setSelectedUnit(unit || null);
    setRoleDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Organisationsstruktur</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die hierarchische Struktur Ihres Unternehmens
          </p>
        </div>
        <Button onClick={handleCreateUnit}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Einheit
        </Button>
      </div>

      <Tabs defaultValue="hierarchy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchy">Hierarchie-Ansicht</TabsTrigger>
          <TabsTrigger value="units">Einheiten-Liste</TabsTrigger>
          <TabsTrigger value="roles">Rollen & Zuweisungen</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organisationshierarchie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationalHierarchyTree
                hierarchy={hierarchy}
                onEditUnit={handleEditUnit}
                onDeleteUnit={handleDeleteUnit}
                onCreateRole={handleCreateRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Organisationseinheiten
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUnits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Keine Einheiten gefunden.' : 'Noch keine Organisationseinheiten erstellt.'}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredUnits.map((unit) => (
                      <Card key={unit.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getTypeIcon(unit.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{unit.name}</h3>
                                {unit.code && (
                                  <Badge variant="outline">{unit.code}</Badge>
                                )}
                                <Badge variant="secondary">
                                  {getTypeLabel(unit.type)}
                                </Badge>
                                {!unit.is_active && (
                                  <Badge variant="destructive">Inaktiv</Badge>
                                )}
                              </div>
                              {unit.description && (
                                <p className="text-sm text-muted-foreground">
                                  {unit.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>Ebene: {unit.level}</span>
                                {unit.cost_center && (
                                  <span>Kostenstelle: {unit.cost_center}</span>
                                )}
                                {unit.manager_id && (
                                  <span>Manager zugewiesen</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateRole(unit)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUnit(unit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUnit(unit)}
                              disabled={!unit.is_active}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Rollen & Zuweisungen
                </CardTitle>
                <Button onClick={() => handleCreateRole()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Rolle zuweisen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <OrganizationalRolesTable
                roles={roles}
                units={units}
                onUpdateRole={updateRole}
                onDeleteRole={deactivateRole}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialoge */}
      <OrganizationalUnitDialog
        open={unitDialogOpen}
        onOpenChange={setUnitDialogOpen}
        unit={editingUnit}
        units={units}
        onSave={editingUnit ? updateUnit : createUnit}
      />

      <OrganizationalRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        units={units}
        selectedUnit={selectedUnit}
        onSave={createRole}
      />
    </div>
  );
};