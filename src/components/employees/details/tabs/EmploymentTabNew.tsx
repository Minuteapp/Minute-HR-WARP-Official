import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, FileText, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmploymentData } from "@/hooks/employee-tabs/useEmploymentData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const skillCategoryLabels: Record<string, string> = {
  technical: "Technisch",
  soft_skill: "Soft Skill",
  language: "Sprache",
  certification: "Zertifizierung",
  tool: "Tool",
  other: "Sonstige"
};

const certificateStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  revoked: "bg-gray-100 text-gray-800"
};

export const EmploymentTabNew = ({ employeeId }: { employeeId: string }) => {
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  
  const {
    skills,
    certificates,
    isLoading,
    addSkill,
    updateSkill,
    deleteSkill,
    addCertificate,
    deleteCertificate
  } = useEmploymentData(employeeId);

  const { register: registerSkill, handleSubmit: handleSubmitSkill, reset: resetSkill, setValue: setValueSkill } = useForm();
  const { register: registerCert, handleSubmit: handleSubmitCert, reset: resetCert, setValue: setValueCert } = useForm();

  const onSubmitSkill = async (data: any) => {
    await addSkill.mutateAsync(data);
    resetSkill();
    setIsSkillDialogOpen(false);
  };

  const onSubmitCert = async (data: any) => {
    await addCertificate.mutateAsync(data);
    resetCert();
    setIsCertDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Lädt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills & Qualifikationen
            </span>
            <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Skill hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuer Skill</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitSkill(onSubmitSkill)} className="space-y-4">
                  <div>
                    <Label>Skill Name</Label>
                    <Input {...registerSkill("skill_name", { required: true })} />
                  </div>
                  <div>
                    <Label>Kategorie</Label>
                    <Select onValueChange={(value) => setValueSkill("skill_category", value)} defaultValue="technical">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technisch</SelectItem>
                        <SelectItem value="soft_skill">Soft Skill</SelectItem>
                        <SelectItem value="language">Sprache</SelectItem>
                        <SelectItem value="certification">Zertifizierung</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="other">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kompetenzlevel (%)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue="50"
                      {...registerSkill("proficiency_level", { min: 0, max: 100 })} 
                    />
                  </div>
                  <div>
                    <Label>Erfahrung (Jahre)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...registerSkill("years_of_experience")} 
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsSkillDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit">Hinzufügen</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skills && skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{skill.skill_name}</h4>
                        <Badge variant="outline">{skillCategoryLabels[skill.skill_category]}</Badge>
                      </div>
                      {skill.years_of_experience && (
                        <p className="text-sm text-muted-foreground">
                          {skill.years_of_experience} Jahre Erfahrung
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteSkill.mutate(skill.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Kompetenzlevel</span>
                      <span className="font-medium">{skill.proficiency_level}%</span>
                    </div>
                    <Progress value={skill.proficiency_level} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Skills vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zertifikate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Zertifikate
            </span>
            <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Zertifikat hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Zertifikat</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitCert(onSubmitCert)} className="space-y-4">
                  <div>
                    <Label>Zertifikatsname</Label>
                    <Input {...registerCert("certificate_name", { required: true })} />
                  </div>
                  <div>
                    <Label>Ausstellende Organisation</Label>
                    <Input {...registerCert("issuing_organization", { required: true })} />
                  </div>
                  <div>
                    <Label>Ausstellungsdatum</Label>
                    <Input type="date" {...registerCert("issue_date", { required: true })} />
                  </div>
                  <div>
                    <Label>Ablaufdatum (optional)</Label>
                    <Input type="date" {...registerCert("expiry_date")} />
                  </div>
                  <div>
                    <Label>Zertifikatsnummer</Label>
                    <Input {...registerCert("certificate_number")} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCertDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit">Hinzufügen</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {certificates && certificates.length > 0 ? (
              certificates.map((cert) => (
                <div key={cert.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{cert.certificate_name}</h4>
                      <Badge className={certificateStatusColors[cert.status]}>
                        {cert.status === 'active' ? 'Aktiv' : cert.status === 'expired' ? 'Abgelaufen' : 'Widerrufen'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Ausgestellt: {format(new Date(cert.issue_date), "dd.MM.yyyy", { locale: de })}</span>
                      {cert.expiry_date && (
                        <span>Gültig bis: {format(new Date(cert.expiry_date), "dd.MM.yyyy", { locale: de })}</span>
                      )}
                    </div>
                    {cert.certificate_number && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Nr.: {cert.certificate_number}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteCertificate.mutate(cert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Zertifikate vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
