import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Users, Plus, Edit, Trash2, Network, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrgUnit {
  id: string;
  name: string;
  type: 'holding' | 'subsidiary' | 'department' | 'team';
  parentId?: string;
  managerId?: string;
  employeeCount: number;
  level: number;
}

export const CompanyOrganization = () => {
  const { toast } = useToast();
  const [orgUnits] = useState<OrgUnit[]>([
    { id: '1', name: 'MINUTE Holding GmbH', type: 'holding', employeeCount: 250, level: 0 },
    { id: '2', name: 'MINUTE Software GmbH', type: 'subsidiary', parentId: '1', employeeCount: 180, level: 1 },
    { id: '3', name: 'MINUTE Consulting GmbH', type: 'subsidiary', parentId: '1', employeeCount: 70, level: 1 },
    { id: '4', name: 'Entwicklung', type: 'department', parentId: '2', employeeCount: 85, level: 2 },
    { id: '5', name: 'Marketing', type: 'department', parentId: '2', employeeCount: 25, level: 2 },
    { id: '6', name: 'Frontend Team', type: 'team', parentId: '4', employeeCount: 15, level: 3 },
    { id: '7', name: 'Backend Team', type: 'team', parentId: '4', employeeCount: 20, level: 3 },
  ]);

  const getTypeLabel = (type: OrgUnit['type']) => {
    const labels = {
      holding: 'Holding',
      subsidiary: 'Tochtergesellschaft',
      department: 'Abteilung',
      team: 'Team'
    };
    return labels[type];
  };

  const getTypeColor = (type: OrgUnit['type']) => {
    const colors = {
      holding: 'bg-purple-500',
      subsidiary: 'bg-blue-500',
      department: 'bg-green-500',
      team: 'bg-orange-500'
    };
    return colors[type];
  };

  const handleGenerateOrgChart = () => {
    toast({
      title: "Organigramm generiert",
      description: "Das Organigramm wurde aus den Mitarbeiterdaten automatisch erstellt.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Organisationsstruktur</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie die Unternehmenshierarchie und Organisationsstruktur.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateOrgChart} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Organigramm generieren
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Organisationseinheit hinzufügen
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hierarchie-Ansicht */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Unternehmenshierarchie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orgUnits.map((unit) => (
                <div key={unit.id} className="space-y-2">
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    style={{ marginLeft: `${unit.level * 20}px` }}
                  >
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(unit.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{unit.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(unit.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {unit.employeeCount} Mitarbeiter
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aktionen und KPIs */}
        <div className="space-y-6">
          {/* Neue Einheit erstellen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Neue Einheit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unit-name">Name</Label>
                <Input 
                  id="unit-name" 
                  placeholder="Einheit benennen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-type">Typ</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holding">Holding</SelectItem>
                    <SelectItem value="subsidiary">Tochtergesellschaft</SelectItem>
                    <SelectItem value="department">Abteilung</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent-unit">Übergeordnete Einheit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Übergeordnet wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Leiter/Manager</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Manager wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="mike">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                Einheit erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Organisation KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organisations-KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Gesamtmitarbeiter</span>
                <Badge variant="outline">250</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm">Organisationsebenen</span>
                <Badge variant="outline">4</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm">Abteilungen</span>
                <Badge variant="outline">8</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm">Teams</span>
                <Badge variant="outline">15</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};