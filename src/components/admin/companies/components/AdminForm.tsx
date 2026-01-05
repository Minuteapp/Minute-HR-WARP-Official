
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminFormData } from "../types";

interface AdminFormProps {
  formData: AdminFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  isSubmitting: boolean;
}

export const AdminForm = ({ 
  formData, 
  onChange, 
  onSelectChange,
  isSubmitting
}: AdminFormProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="salutation" className="text-right">
          Anrede
        </Label>
        <Select 
          defaultValue={formData.salutation || "Herr"} 
          onValueChange={(value) => onSelectChange("salutation", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Anrede wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Herr">Herr</SelectItem>
            <SelectItem value="Frau">Frau</SelectItem>
            <SelectItem value="Divers">Divers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="first_name" className="text-right">
          Vorname
        </Label>
        <Input
          id="first_name"
          name="first_name"
          placeholder="Vorname"
          value={formData.first_name || ""}
          onChange={onChange}
          className="col-span-3"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="last_name" className="text-right">
          Nachname
        </Label>
        <Input
          id="last_name"
          name="last_name"
          placeholder="Nachname"
          value={formData.last_name || ""}
          onChange={onChange}
          className="col-span-3"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          E-Mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@beispiel.de"
          value={formData.email}
          onChange={onChange}
          className="col-span-3"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">
          Telefon
        </Label>
        <Input
          id="phone"
          name="phone"
          placeholder="+49 123 4567890"
          value={formData.phone}
          onChange={onChange}
          className="col-span-3"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position" className="text-right">
          Position
        </Label>
        <Input
          id="position"
          name="position"
          placeholder="z.B. Geschäftsführer"
          value={formData.position || ""}
          onChange={onChange}
          className="col-span-3"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};
