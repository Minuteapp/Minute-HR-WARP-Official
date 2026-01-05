import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useEmployeeCreation } from "@/hooks/useEmployeeCreation";
import { EmployeeFormData } from "@/types/employee.types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Briefcase, FileText, Euro, Calendar, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";

interface AddEmployeeDialogMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  companyId?: string;
}

const AddEmployeeDialogMobile = ({ open, onOpenChange, onSuccess, companyId }: AddEmployeeDialogMobileProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
    country: "",
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
    bankName: ""
  });

  const [probationMonths, setProbationMonths] = useState(6);
  const [remoteWork, setRemoteWork] = useState("");
  const [salaryType, setSalaryType] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [taxClass, setTaxClass] = useState("");
  const [healthInsurance, setHealthInsurance] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [creditInstitute, setCreditInstitute] = useState("");
  const [variableCompensation, setVariableCompensation] = useState(0);
  const [dsgvoChecked, setDsgvoChecked] = useState(false);
  const [safetyInstructionChecked, setSafetyInstructionChecked] = useState(false);
  const [codeOfConductChecked, setCodeOfConductChecked] = useState(false);
  const [notes, setNotes] = useState("");
  const [vacationStartDate, setVacationStartDate] = useState("");
  const [carryoverAllowed, setCarryoverAllowed] = useState(false);
  
  const [jobTicket, setJobTicket] = useState(false);
  const [jobTicketValue, setJobTicketValue] = useState(49);
  const [gymMembership, setGymMembership] = useState(false);
  const [gymValue, setGymValue] = useState(45);
  const [companyPension, setCompanyPension] = useState(false);
  const [companyPensionValue, setCompanyPensionValue] = useState(150);
  const [lunchSubsidy, setLunchSubsidy] = useState(false);
  const [lunchValue, setLunchValue] = useState(100);
  const [companyCar, setCompanyCar] = useState(false);
  const [carModel, setCarModel] = useState("");
  const [laptop, setLaptop] = useState(false);
  const [mobilePhoneIT, setMobilePhoneIT] = useState(false);
  const [externalMonitor, setExternalMonitor] = useState(false);
  const [homeOfficeEquipment, setHomeOfficeEquipment] = useState(false);

  const { createEmployee, isSubmitting } = useEmployeeCreation(() => {
    onSuccess?.();
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    onOpenChange(false);
    toast({
      description: "Der neue Mitarbeiter wurde erfolgreich angelegt."
    });
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() && !formData.lastName.trim()) {
      toast({
        description: "Bitte geben Sie mindestens einen Vor- oder Nachnamen ein.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-full max-h-full p-0 m-0 rounded-none">
        <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
          <Badge variant="secondary" className="bg-gray-700 text-white text-xs px-2 py-1">
            Vorschau
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

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-base font-bold">Neuen Mitarbeiter hinzufügen</h2>
              <p className="text-[11px] text-gray-600 mt-1">
                Erfassen Sie alle wichtigen Informationen für den neuen Mitarbeiter. Pflichtfelder sind mit * gekennzeichnet.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg h-auto">
                  <TabsTrigger 
                    value="personal" 
                    className="flex-1 h-12 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <User className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="employment" 
                    className="flex-1 h-12 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Briefcase className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="flex-1 h-12 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="salary" 
                    className="flex-1 h-12 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Euro className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="vacation" 
                    className="flex-1 h-12 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="text-[13px] font-semibold">Basisdaten</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[11px]">Vorname *</Label>
                        <Input
                          placeholder="z.B. Anna"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Nachname *</Label>
                        <Input
                          placeholder="z.B. Müller"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Geschäftliche E-Mail *</Label>
                        <Input
                          type="email"
                          placeholder="anna.mueller@company.de"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Telefon (geschäftlich)</Label>
                        <Input
                          placeholder="+49 123 4567890"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Geburtsdatum</Label>
                        <Input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Nationalität</Label>
                        <Select value={formData.nationality} onValueChange={(val) => setFormData({...formData, nationality: val})}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-10">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="DE">Deutschland</SelectItem>
                            <SelectItem value="AT">Österreich</SelectItem>
                            <SelectItem value="CH">Schweiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="text-[13px] font-semibold">Adresse</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[11px]">Straße & Hausnummer</Label>
                        <Input
                          placeholder="Musterstraße 123"
                          value={formData.street}
                          onChange={(e) => setFormData({...formData, street: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">PLZ</Label>
                        <Input
                          placeholder="10115"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Stadt</Label>
                        <Input
                          placeholder="Berlin"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="text-[13px] font-semibold">Notfallkontakt</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[11px]">Name</Label>
                        <Input
                          placeholder="Max Müller"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Telefon</Label>
                        <Input
                          placeholder="+49 987 654321"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Beziehung</Label>
                        <Input
                          placeholder="z.B. Ehepartner, Elternteil"
                          value={formData.emergencyContactRelation}
                          onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                          className="mt-1 bg-gray-50 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Employment */}
                <TabsContent value="employment" className="space-y-4">
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Organisatorische Zuordnung</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Mitarbeiternummer</Label>
                        <Input disabled value="Automatisch generiert" className="mt-1 bg-gray-50 h-12" />
                      </div>
                      <div>
                        <Label>Eintrittsdatum *</Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Position *</Label>
                        <Input
                          placeholder="z.B. Senior Developer"
                          value={formData.position}
                          onChange={(e) => setFormData({...formData, position: e.target.value})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Abteilung/Team *</Label>
                        <Select value={formData.team} onValueChange={(val) => setFormData({...formData, team: val})}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Standort *</Label>
                        <Select>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="berlin">Berlin</SelectItem>
                            <SelectItem value="muenchen">München</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Vorgesetzter</Label>
                        <Select>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="manager1">Team Lead 1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Arbeitsmodell</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Arbeitsmodell *</Label>
                        <Select value={formData.employmentType} onValueChange={(val: any) => setFormData({...formData, employmentType: val})}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="full_time">Vollzeit</SelectItem>
                            <SelectItem value="part_time">Teilzeit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Wochenstunden *</Label>
                        <Input
                          type="number"
                          value={formData.workingHours}
                          onChange={(e) => setFormData({...formData, workingHours: Number(e.target.value)})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Vertragsart *</Label>
                        <Select>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="unbefristet">Unbefristet</SelectItem>
                            <SelectItem value="befristet">Befristet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Probezeit (Monate)</Label>
                        <Input
                          type="number"
                          value={probationMonths}
                          onChange={(e) => setProbationMonths(Number(e.target.value))}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Remote-Arbeit</Label>
                        <Select value={remoteWork} onValueChange={setRemoteWork}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="keine">Keine</SelectItem>
                            <SelectItem value="teilweise">Teilweise</SelectItem>
                            <SelectItem value="vollzeit">Vollzeit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Kostenstelle</Label>
                        <Input
                          placeholder="KST-1100"
                          value={formData.costCenter}
                          onChange={(e) => setFormData({...formData, costCenter: e.target.value})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Documents */}
                <TabsContent value="documents" className="space-y-4">
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Vertragsdokumente</h3>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">Arbeitsvertrag hochladen</p>
                      <Button variant="outline" size="sm">Datei auswählen</Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={dsgvoChecked} onCheckedChange={(checked) => setDsgvoChecked(checked as boolean)} />
                        <Label className="text-sm">DSGVO Einwilligung eingeholt</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={safetyInstructionChecked} onCheckedChange={(checked) => setSafetyInstructionChecked(checked as boolean)} />
                        <Label className="text-sm">Arbeitssicherheitsunterweisung erfolgt</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={codeOfConductChecked} onCheckedChange={(checked) => setCodeOfConductChecked(checked as boolean)} />
                        <Label className="text-sm">Code of Conduct akzeptiert</Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Weitere Dokumente</h3>
                    <div>
                      <Label>Notizen / Besonderheiten</Label>
                      <Textarea
                        placeholder="z.B. Allergien, besondere Anforderungen, etc."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 bg-gray-50 min-h-[120px]"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Salary */}
                <TabsContent value="salary" className="space-y-4">
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Vergütung</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Bruttogehalt (monatlich) *</Label>
                        <div className="relative mt-1">
                          <Input
                            type="number"
                            placeholder="5000"
                            value={formData.salaryAmount || ""}
                            onChange={(e) => setFormData({...formData, salaryAmount: Number(e.target.value)})}
                            className="bg-gray-50 h-12 pr-12"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        </div>
                      </div>
                      <div>
                        <Label>Gehaltsart</Label>
                        <Select value={salaryType} onValueChange={setSalaryType}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="monthly">Monatlich</SelectItem>
                            <SelectItem value="hourly">Stündlich</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Variable Vergütung / Bonus</Label>
                        <div className="relative mt-1">
                          <Input
                            type="number"
                            placeholder="0"
                            value={variableCompensation}
                            onChange={(e) => setVariableCompensation(Number(e.target.value))}
                            className="bg-gray-50 h-12 pr-12"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        </div>
                      </div>
                      <div>
                        <Label>Zahlungstag</Label>
                        <Select value={paymentDay} onValueChange={setPaymentDay}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="last">Letzter des Monats</SelectItem>
                            <SelectItem value="15">15. des Monats</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Steuerliche Angaben</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Steuer-ID</Label>
                        <Input
                          placeholder="12 345 678 901"
                          value={formData.taxId}
                          onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Steuerklasse</Label>
                        <Select value={taxClass} onValueChange={setTaxClass}>
                          <SelectTrigger className="mt-1 bg-gray-50 h-12">
                            <SelectValue placeholder="Bitte wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="1">Steuerklasse 1</SelectItem>
                            <SelectItem value="2">Steuerklasse 2</SelectItem>
                            <SelectItem value="3">Steuerklasse 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sozialversicherungsnummer</Label>
                        <Input
                          placeholder="12 345678 A 123"
                          value={formData.socialSecurityNumber}
                          onChange={(e) => setFormData({...formData, socialSecurityNumber: e.target.value})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Krankenkasse</Label>
                        <Input
                          placeholder="z.B. TK, AOK"
                          value={healthInsurance}
                          onChange={(e) => setHealthInsurance(e.target.value)}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Bankverbindung</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>IBAN *</Label>
                        <Input
                          placeholder="DE89 3704 0044 0532 0130 00"
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>BIC</Label>
                        <Input
                          placeholder="COBADEFFXXX"
                          value={bic}
                          onChange={(e) => setBic(e.target.value)}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Kreditinstitut</Label>
                        <Input
                          placeholder="z.B. Commerzbank"
                          value={creditInstitute}
                          onChange={(e) => setCreditInstitute(e.target.value)}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 5: Vacation & Benefits */}
                <TabsContent value="vacation" className="space-y-4">
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Urlaubsanspruch</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Jahresurlaubstage *</Label>
                        <Input
                          type="number"
                          value={formData.vacationDays}
                          onChange={(e) => setFormData({...formData, vacationDays: Number(e.target.value)})}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <Label>Urlaubsjahr beginnt am</Label>
                        <Input
                          type="date"
                          value={vacationStartDate}
                          onChange={(e) => setVacationStartDate(e.target.value)}
                          className="mt-1 bg-gray-50 h-12"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Sonderregelungen</h4>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <Label className="text-sm">Resturlaub kann ins Folgejahr übertragen werden</Label>
                          <Switch checked={carryoverAllowed} onCheckedChange={setCarryoverAllowed} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">Benefits & Vergünstigungen</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm flex-1">Jobticket / ÖPNV-Zuschuss</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={jobTicketValue}
                            onChange={(e) => setJobTicketValue(Number(e.target.value))}
                            className="w-16 h-8 text-center text-sm"
                            disabled={!jobTicket}
                          />
                          <Switch checked={jobTicket} onCheckedChange={setJobTicket} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm flex-1">Fitnessstudio-Mitgliedschaft</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={gymValue}
                            onChange={(e) => setGymValue(Number(e.target.value))}
                            className="w-16 h-8 text-center text-sm"
                            disabled={!gymMembership}
                          />
                          <Switch checked={gymMembership} onCheckedChange={setGymMembership} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm flex-1">Betriebliche Altersvorsorge</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={companyPensionValue}
                            onChange={(e) => setCompanyPensionValue(Number(e.target.value))}
                            className="w-16 h-8 text-center text-sm"
                            disabled={!companyPension}
                          />
                          <Switch checked={companyPension} onCheckedChange={setCompanyPension} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm flex-1">Essenszuschuss / Kantine</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={lunchValue}
                            onChange={(e) => setLunchValue(Number(e.target.value))}
                            className="w-16 h-8 text-center text-sm"
                            disabled={!lunchSubsidy}
                          />
                          <Switch checked={lunchSubsidy} onCheckedChange={setLunchSubsidy} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1 flex items-center gap-2">
                          <Label className="text-sm">Firmenwagen</Label>
                          {companyCar && (
                            <Input
                              placeholder="Modell"
                              value={carModel}
                              onChange={(e) => setCarModel(e.target.value)}
                              className="w-32 h-8 text-sm"
                            />
                          )}
                        </div>
                        <Switch checked={companyCar} onCheckedChange={setCompanyCar} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">IT-Ausstattung</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm">Laptop / Computer</Label>
                        <Switch checked={laptop} onCheckedChange={setLaptop} />
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm">Diensthandy</Label>
                        <Switch checked={mobilePhoneIT} onCheckedChange={setMobilePhoneIT} />
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm">Externer Monitor</Label>
                        <Switch checked={externalMonitor} onCheckedChange={setExternalMonitor} />
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm">Home-Office Ausstattung</Label>
                        <Switch checked={homeOfficeEquipment} onCheckedChange={setHomeOfficeEquipment} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-3 pb-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary text-white"
                  disabled={isSubmitting}
                >
                  Mitarbeiter anlegen
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-12"
                  onClick={() => onOpenChange(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialogMobile;
