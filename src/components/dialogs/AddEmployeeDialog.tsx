import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useEmployeeCreation } from "@/hooks/useEmployeeCreation";
import { EmployeeFormData } from "@/types/employee.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Euro, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from "@/components/ui/use-mobile";
import { Badge } from "@/components/ui/badge";
import { useEmployeesList } from "@/hooks/useEmployeesList";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  companyId?: string;
}

const AddEmployeeDialog = ({ open, onOpenChange, onSuccess, companyId }: AddEmployeeDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { employees } = useEmployeesList();
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    employeeNumber: "",
    department: "",
    position: "",
    team: "",
    employmentType: "full_time",
    startDate: "",
    birthDate: "",
    nationality: "",
    phone: "",
    mobilePhone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Deutschland",
    workingHours: 40,
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    contractEndDate: "",
    costCenter: "",
    managerId: "",
    vacationDays: 30,
    workStartTime: "",
    workEndTime: "",
    lunchBreakStart: "",
    lunchBreakEnd: "",
    salaryAmount: undefined,
    salaryCurrency: "EUR",
    taxId: "",
    socialSecurityNumber: "",
    bankAccountNumber: "",
    bankCode: "",
    bankName: "",
    iban: "",
    bic: "",
    taxClass: "",
    healthInsurance: "",
    probationMonths: 6,
    remoteWork: "",
    location: ""
  });

  const { createEmployee, isSubmitting } = useEmployeeCreation(() => {
    onSuccess?.();
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    onOpenChange(false);
    resetForm();
    toast({
      description: "Der neue Mitarbeiter wurde erfolgreich angelegt."
    });
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      employeeNumber: "",
      department: "",
      position: "",
      team: "",
      employmentType: "full_time",
      startDate: "",
      birthDate: "",
      nationality: "",
      phone: "",
      mobilePhone: "",
      street: "",
      city: "",
      postalCode: "",
      country: "Deutschland",
      workingHours: 40,
      emergencyContactName: "",
      emergencyContactRelation: "",
      emergencyContactPhone: "",
      contractEndDate: "",
      costCenter: "",
      managerId: "",
      vacationDays: 30,
      workStartTime: "",
      workEndTime: "",
      lunchBreakStart: "",
      lunchBreakEnd: "",
      salaryAmount: undefined,
      salaryCurrency: "EUR",
      taxId: "",
      socialSecurityNumber: "",
      bankAccountNumber: "",
      bankCode: "",
      bankName: "",
      iban: "",
      bic: "",
      taxClass: "",
      healthInsurance: "",
      probationMonths: 6,
      remoteWork: "",
      location: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        description: "Bitte geben Sie Vor- und Nachnamen ein.",
        variant: "destructive"
      });
      return;
    }

    
    await createEmployee({
      ...formData,
      onboardingRequired: false,
      companyId: companyId
    });
  };

  const updateField = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "w-full h-full max-w-full max-h-full p-0 m-0 rounded-none" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
        {isMobile ? (
          <>
            {/* Mobile Header */}
            <div className="bg-background px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                Neuer Mitarbeiter
              </Badge>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="personal" className="w-full">
                  <div className="flex gap-1.5 mb-4 bg-muted p-0.5 rounded-lg">
                    <TabsTrigger value="personal" className="flex-1 h-10 rounded-md data-[state=active]:bg-background">
                      <User className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="employment" className="flex-1 h-10 rounded-md data-[state=active]:bg-background">
                      <Briefcase className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="salary" className="flex-1 h-10 rounded-md data-[state=active]:bg-background">
                      <Euro className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="address" className="flex-1 h-10 rounded-md data-[state=active]:bg-background">
                      <MapPin className="w-4 h-4" />
                    </TabsTrigger>
                  </div>

                  {/* Tab 1: Persönliche Daten */}
                  <TabsContent value="personal" className="space-y-4">
                    <div className="bg-card rounded-lg border p-4 space-y-4">
                      <h3 className="font-semibold text-sm">Persönliche Daten</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Vorname *</Label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            className="mt-1"
                            placeholder="Max"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Nachname *</Label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            className="mt-1"
                            placeholder="Mustermann"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">E-Mail *</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="mt-1"
                            placeholder="max.mustermann@firma.de"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Telefon</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className="mt-1"
                            placeholder="+49 123 456789"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Geburtsdatum</Label>
                          <Input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => updateField('birthDate', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Nationalität</Label>
                          <Select value={formData.nationality} onValueChange={(val) => updateField('nationality', val)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DE">Deutschland</SelectItem>
                              <SelectItem value="AT">Österreich</SelectItem>
                              <SelectItem value="CH">Schweiz</SelectItem>
                              <SelectItem value="other">Andere</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Anstellung */}
                  <TabsContent value="employment" className="space-y-4">
                    <div className="bg-card rounded-lg border p-4 space-y-4">
                      <h3 className="font-semibold text-sm">Anstellung</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Eintrittsdatum *</Label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => updateField('startDate', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Position *</Label>
                          <Input
                            value={formData.position}
                            onChange={(e) => updateField('position', e.target.value)}
                            className="mt-1"
                            placeholder="z.B. Software Developer"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Abteilung</Label>
                          <Input
                            value={formData.department}
                            onChange={(e) => updateField('department', e.target.value)}
                            className="mt-1"
                            placeholder="z.B. IT"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Team</Label>
                          <Select value={formData.team} onValueChange={(val) => updateField('team', val)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Team auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Beschäftigungsart</Label>
                          <Select value={formData.employmentType} onValueChange={(val: any) => updateField('employmentType', val)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
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
                        <div>
                          <Label className="text-xs">Wochenstunden</Label>
                          <Input
                            type="number"
                            value={formData.workingHours || ''}
                            onChange={(e) => updateField('workingHours', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="mt-1"
                            placeholder="40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Vorgesetzter</Label>
                          <Select value={formData.managerId || ''} onValueChange={(val) => updateField('managerId', val)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Kostenstelle</Label>
                          <Input
                            value={formData.costCenter || ''}
                            onChange={(e) => updateField('costCenter', e.target.value)}
                            className="mt-1"
                            placeholder="z.B. KST-001"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Gehalt & Steuer */}
                  <TabsContent value="salary" className="space-y-4">
                    <div className="bg-card rounded-lg border p-4 space-y-4">
                      <h3 className="font-semibold text-sm">Gehalt & Steuer</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Bruttogehalt (monatlich)</Label>
                          <Input
                            type="number"
                            value={formData.salaryAmount || ''}
                            onChange={(e) => updateField('salaryAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="mt-1"
                            placeholder="4500"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Steuer-ID</Label>
                          <Input
                            value={formData.taxId || ''}
                            onChange={(e) => updateField('taxId', e.target.value)}
                            className="mt-1"
                            placeholder="12345678901"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Steuerklasse</Label>
                          <Select value={formData.taxClass || ''} onValueChange={(val) => updateField('taxClass', val)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Klasse 1</SelectItem>
                              <SelectItem value="2">Klasse 2</SelectItem>
                              <SelectItem value="3">Klasse 3</SelectItem>
                              <SelectItem value="4">Klasse 4</SelectItem>
                              <SelectItem value="5">Klasse 5</SelectItem>
                              <SelectItem value="6">Klasse 6</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Sozialversicherungsnummer</Label>
                          <Input
                            value={formData.socialSecurityNumber || ''}
                            onChange={(e) => updateField('socialSecurityNumber', e.target.value)}
                            className="mt-1"
                            placeholder="12345678A901"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Krankenkasse</Label>
                          <Input
                            value={formData.healthInsurance || ''}
                            onChange={(e) => updateField('healthInsurance', e.target.value)}
                            className="mt-1"
                            placeholder="z.B. AOK"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 space-y-4">
                      <h3 className="font-semibold text-sm">Bankverbindung</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">IBAN</Label>
                          <Input
                            value={formData.iban || ''}
                            onChange={(e) => updateField('iban', e.target.value)}
                            className="mt-1"
                            placeholder="DE89 3704 0044 0532 0130 00"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">BIC</Label>
                          <Input
                            value={formData.bic || ''}
                            onChange={(e) => updateField('bic', e.target.value)}
                            className="mt-1"
                            placeholder="COBADEFFXXX"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Bankname</Label>
                          <Input
                            value={formData.bankName || ''}
                            onChange={(e) => updateField('bankName', e.target.value)}
                            className="mt-1"
                            placeholder="z.B. Deutsche Bank"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 4: Adresse */}
                  <TabsContent value="address" className="space-y-4">
                    <div className="bg-card rounded-lg border p-4 space-y-4">
                      <h3 className="font-semibold text-sm">Adresse</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Straße & Hausnummer</Label>
                          <Input
                            value={formData.street || ''}
                            onChange={(e) => updateField('street', e.target.value)}
                            className="mt-1"
                            placeholder="Musterstraße 123"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Postleitzahl</Label>
                          <Input
                            value={formData.postalCode || ''}
                            onChange={(e) => updateField('postalCode', e.target.value)}
                            className="mt-1"
                            placeholder="10115"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Stadt</Label>
                          <Input
                            value={formData.city || ''}
                            onChange={(e) => updateField('city', e.target.value)}
                            className="mt-1"
                            placeholder="Berlin"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Land</Label>
                          <Input
                            value={formData.country || ''}
                            onChange={(e) => updateField('country', e.target.value)}
                            className="mt-1"
                            placeholder="Deutschland"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Wird gespeichert..." : "Mitarbeiter anlegen"}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Desktop Layout */
          <>
            <DialogHeader>
              <DialogTitle>Neuen Mitarbeiter anlegen</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Persönliche Daten</TabsTrigger>
                  <TabsTrigger value="employment">Anstellung</TabsTrigger>
                  <TabsTrigger value="salary">Gehalt & Steuer</TabsTrigger>
                  <TabsTrigger value="address">Adresse</TabsTrigger>
                </TabsList>

                {/* Tab 1: Persönliche Daten */}
                <TabsContent value="personal" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vorname *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        placeholder="Max"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nachname *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        placeholder="Mustermann"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-Mail *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="max.mustermann@firma.de"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+49 123 456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Geburtsdatum</Label>
                      <Input
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => updateField('birthDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nationalität</Label>
                      <Select value={formData.nationality || ''} onValueChange={(val) => updateField('nationality', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DE">Deutschland</SelectItem>
                          <SelectItem value="AT">Österreich</SelectItem>
                          <SelectItem value="CH">Schweiz</SelectItem>
                          <SelectItem value="other">Andere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Anstellung */}
                <TabsContent value="employment" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Eintrittsdatum *</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => updateField('startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position *</Label>
                      <Input
                        value={formData.position}
                        onChange={(e) => updateField('position', e.target.value)}
                        placeholder="z.B. Software Developer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Abteilung</Label>
                      <Input
                        value={formData.department}
                        onChange={(e) => updateField('department', e.target.value)}
                        placeholder="z.B. IT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Team</Label>
                      <Select value={formData.team} onValueChange={(val) => updateField('team', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Team auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Beschäftigungsart</Label>
                      <Select value={formData.employmentType} onValueChange={(val: any) => updateField('employmentType', val)}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label>Wochenstunden</Label>
                      <Input
                        type="number"
                        value={formData.workingHours || ''}
                        onChange={(e) => updateField('workingHours', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vorgesetzter</Label>
                      <Select value={formData.managerId || ''} onValueChange={(val) => updateField('managerId', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Kostenstelle</Label>
                      <Input
                        value={formData.costCenter || ''}
                        onChange={(e) => updateField('costCenter', e.target.value)}
                        placeholder="z.B. KST-001"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Gehalt & Steuer */}
                <TabsContent value="salary" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bruttogehalt (monatlich)</Label>
                      <Input
                        type="number"
                        value={formData.salaryAmount || ''}
                        onChange={(e) => updateField('salaryAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="4500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Steuer-ID</Label>
                      <Input
                        value={formData.taxId || ''}
                        onChange={(e) => updateField('taxId', e.target.value)}
                        placeholder="12345678901"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Steuerklasse</Label>
                      <Select value={formData.taxClass || ''} onValueChange={(val) => updateField('taxClass', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Klasse 1</SelectItem>
                          <SelectItem value="2">Klasse 2</SelectItem>
                          <SelectItem value="3">Klasse 3</SelectItem>
                          <SelectItem value="4">Klasse 4</SelectItem>
                          <SelectItem value="5">Klasse 5</SelectItem>
                          <SelectItem value="6">Klasse 6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sozialversicherungsnummer</Label>
                      <Input
                        value={formData.socialSecurityNumber || ''}
                        onChange={(e) => updateField('socialSecurityNumber', e.target.value)}
                        placeholder="12345678A901"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Krankenkasse</Label>
                      <Input
                        value={formData.healthInsurance || ''}
                        onChange={(e) => updateField('healthInsurance', e.target.value)}
                        placeholder="z.B. AOK"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-4">Bankverbindung</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>IBAN</Label>
                        <Input
                          value={formData.iban || ''}
                          onChange={(e) => updateField('iban', e.target.value)}
                          placeholder="DE89 3704 0044 0532 0130 00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>BIC</Label>
                        <Input
                          value={formData.bic || ''}
                          onChange={(e) => updateField('bic', e.target.value)}
                          placeholder="COBADEFFXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bankname</Label>
                        <Input
                          value={formData.bankName || ''}
                          onChange={(e) => updateField('bankName', e.target.value)}
                          placeholder="z.B. Deutsche Bank"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Adresse */}
                <TabsContent value="address" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Straße & Hausnummer</Label>
                      <Input
                        value={formData.street || ''}
                        onChange={(e) => updateField('street', e.target.value)}
                        placeholder="Musterstraße 123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postleitzahl</Label>
                      <Input
                        value={formData.postalCode || ''}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        placeholder="10115"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stadt</Label>
                      <Input
                        value={formData.city || ''}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Berlin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Land</Label>
                      <Input
                        value={formData.country || ''}
                        onChange={(e) => updateField('country', e.target.value)}
                        placeholder="Deutschland"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Wird gespeichert..." : "Mitarbeiter anlegen"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
