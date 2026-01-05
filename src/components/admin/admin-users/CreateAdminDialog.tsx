import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdminDialog({ open, onOpenChange }: CreateAdminDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    permissions: {
      readOnly: false,
      readWrite: false,
      fullAccess: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
      });
      return;
    }

    console.log('Creating admin:', formData);
    
    toast({
      title: 'Admin erstellt',
      description: 'Der Admin wurde erfolgreich erstellt und erhält ein Erstpasswort per E-Mail.',
    });
    
    onOpenChange(false);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      permissions: {
        readOnly: false,
        readWrite: false,
        fullAccess: false
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Admin erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Admin-Benutzer mit spezifischen Rollen und Berechtigungen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Max"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Mustermann"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              E-Mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@beispiel.de"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+49 30 123456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">
              Firma (Mandant) <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Firma auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="techvision">TechVision GmbH</SelectItem>
                <SelectItem value="greenenergy">GreenEnergy Solutions AG</SelectItem>
                <SelectItem value="startuplab">StartupLab Berlin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Firmen-Admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant-admin">Firmen-Admin</SelectItem>
                <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                <SelectItem value="billing-admin">Abrechnungs-Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <Label>Berechtigungen</Label>
            <div className="space-y-2 border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="readOnly"
                  checked={formData.permissions.readOnly}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, readOnly: checked as boolean }
                    })
                  }
                />
                <label htmlFor="readOnly" className="text-sm cursor-pointer">
                  Nur Lesen
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="readWrite"
                  checked={formData.permissions.readWrite}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, readWrite: checked as boolean }
                    })
                  }
                />
                <label htmlFor="readWrite" className="text-sm cursor-pointer">
                  Lesen & Schreiben
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fullAccess"
                  checked={formData.permissions.fullAccess}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, fullAccess: checked as boolean }
                    })
                  }
                />
                <label htmlFor="fullAccess" className="text-sm cursor-pointer">
                  Vollzugriff
                </label>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Der Admin erhält automatisch eine Erstpasswort.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Admin erstellen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
