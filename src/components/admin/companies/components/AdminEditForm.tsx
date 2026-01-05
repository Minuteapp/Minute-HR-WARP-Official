
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompanyAdmin } from "../types";

interface AdminEditFormProps {
  admin: CompanyAdmin | null;
  formData: {
    salutation: string;
    firstName: string;
    lastName: string;
    phone: string;
    position: string;
  };
  isSubmitting: boolean;
  onSelectChange: (value: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const AdminEditForm: React.FC<AdminEditFormProps> = ({
  admin,
  formData,
  isSubmitting,
  onSelectChange,
  onChange,
  onSubmit,
  onClose
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="salutation">Anrede</Label>
        <Select 
          value={formData.salutation} 
          onValueChange={onSelectChange}
        >
          <SelectTrigger id="salutation" className="w-full">
            <SelectValue placeholder="Anrede auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Herr">Herr</SelectItem>
            <SelectItem value="Frau">Frau</SelectItem>
            <SelectItem value="Divers">Divers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          value={admin?.email || ""}
          disabled
          className="bg-gray-100"
        />
        <p className="text-xs text-gray-500">Die E-Mail-Adresse kann nicht geändert werden.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon (optional)</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="+49 123 4567890"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Position (optional)</Label>
        <Input
          id="position"
          name="position"
          value={formData.position}
          onChange={onChange}
          placeholder="z.B. HR Manager"
        />
      </div>
      
      <DialogFooter className="pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          disabled={isSubmitting}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </DialogFooter>
    </form>
  );
};
