import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, FileText, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface AbsenceType {
  id: string;
  name: string;
  category: string;
  color: string;
  requiresDocument: boolean;
  documentDaysThreshold: number;
  maxDaysPerYear?: number;
  deductsFromVacation: boolean;
  isActive: boolean;
}

export const AbsenceTypesSettings = () => {
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
  const canEdit = hasPermission('absence_settings');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AbsenceType | null>(null);

  const [absenceTypes] = useState<AbsenceType[]>([
    {
      id: '1',
      name: 'Urlaub',
      category: 'vacation',
      color: '#22c55e',
      requiresDocument: false,
      documentDaysThreshold: 0,
      maxDaysPerYear: 30,
      deductsFromVacation: true,
      isActive: true,
    },
    {
      id: '2',
      name: 'Krankheit',
      category: 'sick',
      color: '#ef4444',
      requiresDocument: true,
      documentDaysThreshold: 3,
      deductsFromVacation: false,
      isActive: true,
    },
    {
      id: '3',
      name: 'Elternzeit',
      category: 'parental',
      color: '#3b82f6',
      requiresDocument: true,
      documentDaysThreshold: 1,
      deductsFromVacation: false,
      isActive: true,
    },
    {
      id: '4',
      name: 'Sonderurlaub',
      category: 'special',
      color: '#f97316',
      requiresDocument: false,
      documentDaysThreshold: 0,
      maxDaysPerYear: 5,
      deductsFromVacation: false,
      isActive: true,
    },
    {
      id: '5',
      name: 'Homeoffice',
      category: 'remote',
      color: '#eab308',
      requiresDocument: false,
      documentDaysThreshold: 0,
      deductsFromVacation: false,
      isActive: true,
    },
  ]);

  const handleSave = () => {
    toast({
      title: "Abwesenheitsarten gespeichert",
      description: "Die Abwesenheitsarten wurden erfolgreich aktualisiert.",
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick: 'Krankheit',
      parental: 'Elternzeit',
      special: 'Sonderurlaub',
      remote: 'Remote/Homeoffice',
      other: 'Sonstige',
    };
    return labels[category] || category;
  };

  const AbsenceTypeForm = ({ type, onClose }: { type?: AbsenceType; onClose: () => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type-name">Name der Abwesenheitsart</Label>
          <Input
            id="type-name"
            defaultValue={type?.name}
            placeholder="z.B. Urlaub, Krankheit"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type-category">Kategorie</Label>
          <Select defaultValue={type?.category}>
            <SelectTrigger>
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacation">Urlaub</SelectItem>
              <SelectItem value="sick">Krankheit</SelectItem>
              <SelectItem value="parental">Elternzeit</SelectItem>
              <SelectItem value="special">Sonderurlaub</SelectItem>
              <SelectItem value="remote">Remote/Homeoffice</SelectItem>
              <SelectItem value="other">Sonstige</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type-color">Farbe (Kalenderdarstellung)</Label>
          <Input
            id="type-color"
            type="color"
            defaultValue={type?.color || '#3b82f6'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-days">Max. Tage pro Jahr (optional)</Label>
          <Input
            id="max-days"
            type="number"
            defaultValue={type?.maxDaysPerYear}
            placeholder="z.B. 30"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Nachweis erforderlich</Label>
            <p className="text-sm text-muted-foreground">
              Dokumente (z.B. Attest) müssen hochgeladen werden
            </p>
          </div>
          <Switch defaultChecked={type?.requiresDocument} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-threshold">Nachweis ab Tag</Label>
          <Input
            id="document-threshold"
            type="number"
            defaultValue={type?.documentDaysThreshold || 3}
            placeholder="3"
          />
          <p className="text-sm text-muted-foreground">
            Ab wie vielen Tagen ist ein Nachweis erforderlich?
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Vom Urlaubskonto abziehen</Label>
            <p className="text-sm text-muted-foreground">
              Diese Abwesenheitsart wird vom jährlichen Urlaubskontingent abgezogen
            </p>
          </div>
          <Switch defaultChecked={type?.deductsFromVacation} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Aktiv</Label>
            <p className="text-sm text-muted-foreground">
              Abwesenheitsart kann für neue Anträge verwendet werden
            </p>
          </div>
          <Switch defaultChecked={type?.isActive ?? true} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={() => { handleSave(); onClose(); }}>
          <Save className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Abwesenheitsarten</h2>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Neue Abwesenheitsart
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Abwesenheitsart erstellen</DialogTitle>
              </DialogHeader>
              <AbsenceTypeForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Konfigurierte Abwesenheitsarten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Farbe</TableHead>
                <TableHead>Max. Tage/Jahr</TableHead>
                <TableHead>Nachweis ab Tag</TableHead>
                <TableHead>Status</TableHead>
                {canEdit && <TableHead>Aktionen</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {absenceTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(type.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {type.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {type.maxDaysPerYear ? `${type.maxDaysPerYear} Tage` : '—'}
                  </TableCell>
                  <TableCell>
                    {type.requiresDocument ? `${type.documentDaysThreshold} Tage` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingType(type)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Abwesenheitsart bearbeiten</DialogTitle>
                            </DialogHeader>
                            <AbsenceTypeForm 
                              type={editingType || undefined} 
                              onClose={() => setEditingType(null)} 
                            />
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};