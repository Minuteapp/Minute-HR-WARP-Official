
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeFormData } from "@/types/employee.types";
import { ReactNode, useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { NationalitySelect } from "@/components/ui/nationality-select";
import { useEmployeesList } from "@/hooks/useEmployeesList";
import { employeeOrgService, OrganizationalUnitOption } from "@/services/employeeOrgService";
import { useCompanyId } from "@/hooks/useCompanyId";

interface EmployeeFormProps {
  formData: EmployeeFormData;
  onFormDataChange: (formData: EmployeeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  children?: ReactNode;
}

export const EmployeeForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  children
}: EmployeeFormProps) => {
  const { employees } = useEmployeesList();
  const { companyId } = useCompanyId();
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnitOption[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
      if (companyId) {
        const units = await employeeOrgService.getAvailableUnits(companyId);
        setOrganizationalUnits(units);
      }
    };
    loadUnits();
  }, [companyId]);
  
  return (
    <form onSubmit={onSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="employment">Beschäftigung</TabsTrigger>
          <TabsTrigger value="personal">Persönliche Daten</TabsTrigger>
          <TabsTrigger value="contact">Kontakt & Notfall</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Mitarbeiternummer</Label>
              <Input
                id="employeeNumber"
                value={formData.employeeNumber}
                onChange={(e) => onFormDataChange({ ...formData, employeeNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationalUnitId">Abteilung (Organigramm)</Label>
              <Select
                value={formData.organizationalUnitId || ''}
                onValueChange={(value) => {
                  // Finde die ausgewählte Unit um den Namen zu setzen
                  const selectedUnit = organizationalUnits.find(u => u.id === value);
                  onFormDataChange({ 
                    ...formData, 
                    organizationalUnitId: value,
                    department: selectedUnit?.name || formData.department
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {organizationalUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.type === 'department' ? 'Abteilung' : 
                                   unit.type === 'team' ? 'Team' : 
                                   unit.type === 'area' ? 'Bereich' : unit.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationalRoleType">Position im Organigramm</Label>
              <Select
                value={formData.organizationalRoleType || 'member'}
                onValueChange={(value: any) => onFormDataChange({ ...formData, organizationalRoleType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Mitarbeiter</SelectItem>
                  <SelectItem value="manager">Leiter/Manager</SelectItem>
                  <SelectItem value="deputy">Stellvertreter</SelectItem>
                  <SelectItem value="assistant">Assistent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => onFormDataChange({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={formData.team}
                onValueChange={(value) => onFormDataChange({ ...formData, team: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Team auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Entwicklung</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Vertrieb</SelectItem>
                  <SelectItem value="hr">Personal</SelectItem>
                  <SelectItem value="finance">Finanzen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Beschäftigungsart</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value: any) => onFormDataChange({ ...formData, employmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Beschäftigungsart auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Vollzeit</SelectItem>
                  <SelectItem value="part_time">Teilzeit</SelectItem>
                  <SelectItem value="temporary">Befristet</SelectItem>
                  <SelectItem value="freelance">Freiberuflich</SelectItem>
                  <SelectItem value="intern">Praktikant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormDataChange({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">Wochenstunden</Label>
              <Input
                id="workingHours"
                type="number"
                value={formData.workingHours || ''}
                onChange={(e) => onFormDataChange({ ...formData, workingHours: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 40"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contractEndDate">Vertragsende (optional)</Label>
              <DatePicker
                date={formData.contractEndDate ? new Date(formData.contractEndDate) : undefined}
                onChange={(date) => onFormDataChange({ ...formData, contractEndDate: date ? date.toISOString().split('T')[0] : '' })}
                placeholder="Vertragsende auswählen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costCenter">Kostenstelle</Label>
              <Input
                id="costCenter"
                value={formData.costCenter || ''}
                onChange={(e) => onFormDataChange({ ...formData, costCenter: e.target.value })}
                placeholder="z.B. KST-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacationDays">Urlaubstage pro Jahr</Label>
              <Input
                id="vacationDays"
                type="number"
                value={formData.vacationDays || ''}
                onChange={(e) => onFormDataChange({ ...formData, vacationDays: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerId">Vorgesetzter</Label>
              <Select
                value={formData.managerId || ''}
                onValueChange={(value) => onFormDataChange({ ...formData, managerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vorgesetzten auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Arbeitszeiten</h4>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workStartTime">Arbeitsbeginn</Label>
                  <Input
                    id="workStartTime"
                    type="time"
                    value={formData.workStartTime || ''}
                    onChange={(e) => onFormDataChange({ ...formData, workStartTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workEndTime">Arbeitsende</Label>
                  <Input
                    id="workEndTime"
                    type="time"
                    value={formData.workEndTime || ''}
                    onChange={(e) => onFormDataChange({ ...formData, workEndTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lunchBreakStart">Pausenbeginn</Label>
                  <Input
                    id="lunchBreakStart"
                    type="time"
                    value={formData.lunchBreakStart || ''}
                    onChange={(e) => onFormDataChange({ ...formData, lunchBreakStart: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lunchBreakEnd">Pausenende</Label>
                  <Input
                    id="lunchBreakEnd"
                    type="time"
                    value={formData.lunchBreakEnd || ''}
                    onChange={(e) => onFormDataChange({ ...formData, lunchBreakEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Vergütung</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryAmount">Gehalt</Label>
                  <Input
                    id="salaryAmount"
                    type="number"
                    step="0.01"
                    value={formData.salaryAmount || ''}
                    onChange={(e) => onFormDataChange({ ...formData, salaryAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="z.B. 4500.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryCurrency">Währung</Label>
                  <Select
                    value={formData.salaryCurrency || 'EUR'}
                    onValueChange={(value) => onFormDataChange({ ...formData, salaryCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Währung auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Steuer- und Sozialversicherungsdaten</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Steuer-ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId || ''}
                    onChange={(e) => onFormDataChange({ ...formData, taxId: e.target.value })}
                    placeholder="z.B. 12345678901"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialSecurityNumber">Sozialversicherungsnummer</Label>
                  <Input
                    id="socialSecurityNumber"
                    value={formData.socialSecurityNumber || ''}
                    onChange={(e) => onFormDataChange({ ...formData, socialSecurityNumber: e.target.value })}
                    placeholder="z.B. 12345678A901"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Bankverbindung</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bankname</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ''}
                    onChange={(e) => onFormDataChange({ ...formData, bankName: e.target.value })}
                    placeholder="z.B. Deutsche Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankCode">BLZ</Label>
                  <Input
                    id="bankCode"
                    value={formData.bankCode || ''}
                    onChange={(e) => onFormDataChange({ ...formData, bankCode: e.target.value })}
                    placeholder="z.B. 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Kontonummer/IBAN</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => onFormDataChange({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="z.B. DE89 3704 0044 0532 0130 00"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Geburtsdatum</Label>
              <DatePicker
                date={formData.birthDate ? new Date(formData.birthDate) : undefined}
                onChange={(date) => onFormDataChange({ ...formData, birthDate: date ? date.toISOString().split('T')[0] : '' })}
                placeholder="Geburtsdatum auswählen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationalität</Label>
              <NationalitySelect
                value={formData.nationality || ''}
                onValueChange={(value) => onFormDataChange({ ...formData, nationality: value })}
                placeholder="Nationalität auswählen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Straße und Hausnummer</Label>
              <Input
                id="street"
                value={formData.street || ''}
                onChange={(e) => onFormDataChange({ ...formData, street: e.target.value })}
                placeholder="z.B. Musterstraße 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                placeholder="z.B. Berlin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postleitzahl</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ''}
                onChange={(e) => onFormDataChange({ ...formData, postalCode: e.target.value })}
                placeholder="z.B. 10115"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => onFormDataChange({ ...formData, country: e.target.value })}
                placeholder="z.B. Deutschland"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (Festnetz)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                placeholder="z.B. +49 30 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Mobiltelefon</Label>
              <Input
                id="mobilePhone"
                type="tel"
                value={formData.mobilePhone || ''}
                onChange={(e) => onFormDataChange({ ...formData, mobilePhone: e.target.value })}
                placeholder="z.B. +49 171 1234567"
              />
            </div>

            <div className="col-span-2 space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Notfallkontakt</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Name des Notfallkontakts</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName || ''}
                    onChange={(e) => onFormDataChange({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="z.B. Max Mustermann"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Beziehung</Label>
                  <Select
                    value={formData.emergencyContactRelation || ''}
                    onValueChange={(value) => onFormDataChange({ ...formData, emergencyContactRelation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Beziehung auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Elternteil</SelectItem>
                      <SelectItem value="spouse">Ehepartner</SelectItem>
                      <SelectItem value="sibling">Geschwister</SelectItem>
                      <SelectItem value="child">Kind</SelectItem>
                      <SelectItem value="friend">Freund/in</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Telefonnummer Notfallkontakt</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone || ''}
                    onChange={(e) => onFormDataChange({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="z.B. +49 171 1234567"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {children}

      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>
    </form>
  );
};
