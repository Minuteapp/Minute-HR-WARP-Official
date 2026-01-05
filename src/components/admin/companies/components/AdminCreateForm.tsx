
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminCreateFormProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    position: string;
    salutation: string;
    password: string;
    createDirectly: boolean;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export const AdminCreateForm: React.FC<AdminCreateFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleChange,
  handleSelectChange,
  handleCheckboxChange,
  handleSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="salutation">Anrede</Label>
        <Select 
          defaultValue={formData.salutation} 
          onValueChange={(value) => handleSelectChange("salutation", value)}
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
        {errors.salutation && (
          <p className="text-sm text-red-500">{errors.salutation}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="Max"
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Mustermann"
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="max.mustermann@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+49 123 4567890"
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position (optional)</Label>
        <Input
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="z.B. HR Manager"
        />
        {errors.position && (
          <p className="text-sm text-red-500">{errors.position}</p>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="createDirectly"
            checked={formData.createDirectly}
            onCheckedChange={(checked) => handleCheckboxChange("createDirectly", checked as boolean)}
          />
          <Label htmlFor="createDirectly" className="text-sm font-medium">
            Admin direkt erstellen (für Tests)
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Wenn aktiviert, wird der Admin direkt mit einem Passwort erstellt, anstatt eine Einladung zu senden.
        </p>
        
        {formData.createDirectly && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={formData.createDirectly}
              placeholder="Mindestens 6 Zeichen"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird erstellt..." : (formData.createDirectly ? "Admin erstellen" : "Einladung senden")}
        </Button>
      </DialogFooter>
    </form>
  );
};
