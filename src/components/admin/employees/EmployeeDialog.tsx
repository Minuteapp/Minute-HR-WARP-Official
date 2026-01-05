
import { Employee } from "@/types/employee.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  companyId?: string;
}

export const EmployeeDialog = ({ 
  open, 
  onOpenChange, 
  employee,
  companyId
}: EmployeeDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    position: employee?.position || "",
    department: employee?.department || "",
    status: (employee?.status as string) || "active"
  });

  useEffect(() => {
    setFormData({
      name: employee?.name || "",
      email: employee?.email || "",
      position: employee?.position || "",
      department: employee?.department || "",
      status: (employee?.status as string) || "active"
    });
  }, [employee]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (employee) {
        // UPDATE: Bestehenden Mitarbeiter aktualisieren
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name || null,
            email: formData.email || null,
            position: formData.position || null,
            department: formData.department || null,
            status: formData.status as any,
          })
          .eq('id', employee.id);
        if (error) throw error;
        toast({ title: 'Gespeichert', description: 'Mitarbeiterdaten wurden aktualisiert.' });
      } else {
        // INSERT: Neuen Mitarbeiter über RPC-Funktion erstellen
        const nameParts = formData.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const { data, error } = await supabase.rpc('create_employee_without_company_id', {
          p_first_name: firstName || 'Unbekannt',
          p_last_name: lastName || '',
          p_name: formData.name || null,
          p_email: formData.email || null,
          p_position: formData.position || null,
          p_department: formData.department || null,
          p_team: null,
          p_employee_number: null,
          p_employment_type: null,
          p_start_date: null,
          p_onboarding_required: false,
          p_company_id: companyId || null
        });
        
        if (error) throw error;
        toast({ title: 'Hinzugefügt', description: 'Neuer Mitarbeiter wurde angelegt.' });
      }
      // Liste neu laden
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error?.message || 'Aktion fehlgeschlagen.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Mitarbeiter bearbeiten" : "Neuen Mitarbeiter hinzufügen"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <Input 
              id="position"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department">Abteilung</Label>
            <Input 
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
                <SelectItem value="onboarding">In Einarbeitung</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {employee ? (isSubmitting ? 'Speichert…' : 'Speichern') : (isSubmitting ? 'Wird hinzugefügt…' : 'Hinzufügen')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
