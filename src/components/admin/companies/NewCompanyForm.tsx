import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CompanyFormData } from "./types";

interface NewCompanyFormProps {
  onSubmit: (formData: CompanyFormData, options?: { importDefaults?: boolean }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const NewCompanyForm = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: NewCompanyFormProps) => {
  const [importDefaults, setImportDefaults] = useState(true);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    street: "",
    house_number: "",
    postal_code: "",
    city: "",
    email: "",
    phone: "",
    website: "",
    tax_id: "",
    vat_id: "",
    contact_person: "",
    subscription_status: "free",
    company_size: "small",
    currency: "EUR",
    onboarding_status: "pending",
    max_users: 10,
    max_storage_gb: 5,
    billing_cycle: "monthly",
    auto_renewal: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData, { importDefaults });
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        {/* Firmenname */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Firmenname
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="Name der Firma"
            required
          />
        </div>
        
        {/* Adresse - aufgeteilt in Straße, Hausnummer, PLZ und Ort */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="street" className="text-right">
            Straße
          </Label>
          <Input
            id="street"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="col-span-2"
            placeholder="Straße"
          />
          <Input
            id="house_number"
            name="house_number"
            value={formData.house_number}
            onChange={handleInputChange}
            className="col-span-1"
            placeholder="Nr."
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="postal_code" className="text-right">
            PLZ / Ort
          </Label>
          <Input
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            className="col-span-1"
            placeholder="PLZ"
          />
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="col-span-2"
            placeholder="Ort"
          />
        </div>

        {/* Steuernummer / USt-ID */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tax_id" className="text-right">
            Steuernummer
          </Label>
          <Input
            id="tax_id"
            name="tax_id"
            value={formData.tax_id}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="Steuernummer"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vat_id" className="text-right">
            USt-ID
          </Label>
          <Input
            id="vat_id"
            name="vat_id"
            value={formData.vat_id}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="Umsatzsteuer-ID"
          />
        </div>

        {/* Ansprechpartner */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="contact_person" className="text-right">
            Ansprechpartner
          </Label>
          <Input
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="Name des Ansprechpartners"
          />
        </div>

        {/* Kontaktinformationen */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            E-Mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="kontakt@firma.de"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            Telefon
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="+49 123 4567890"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="website" className="text-right">
            Website
          </Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="www.firma.de"
          />
        </div>

        {/* Standard-Stammdaten Option */}
        <div className="col-span-4 flex items-start space-x-3 pt-2 border-t">
          <Checkbox
            id="importDefaults"
            checked={importDefaults}
            onCheckedChange={(checked) => setImportDefaults(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="importDefaults" className="font-medium cursor-pointer">
              Deutsche Standard-Stammdaten importieren
            </Label>
            <p className="text-sm text-muted-foreground">
              Abwesenheitstypen (Urlaub, Krankheit, Elternzeit, etc.) automatisch anlegen
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name}>
          Speichern
        </Button>
      </div>
    </>
  );
};
