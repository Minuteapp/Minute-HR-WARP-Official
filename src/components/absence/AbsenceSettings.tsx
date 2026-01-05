
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Save, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AbsenceType = {
  id: string;
  name: string;
  requiresApproval: boolean;
  maxDays: number;
  color: string;
}

interface AbsenceTypeBadgeProps {
  type: AbsenceType | string;
}

const AbsenceTypeBadge: React.FC<AbsenceTypeBadgeProps> = ({ type }) => {
  // Überprüfen, ob der Typ ein String oder ein Objekt ist
  const typeId = typeof type === 'string' ? type : type.id;
  const typeName = typeof type === 'string' ? type : type.name;

  // Stil basierend auf dem Typ festlegen
  let badgeStyle = "";
  
  switch (typeId) {
    case "vacation":
      badgeStyle = "bg-blue-100 text-blue-800 border-blue-200";
      break;
    case "sick":
      badgeStyle = "bg-red-100 text-red-800 border-red-200";
      break;
    case "homeoffice":
      badgeStyle = "bg-green-100 text-green-800 border-green-200";
      break;
    case "business":
      badgeStyle = "bg-purple-100 text-purple-800 border-purple-200";
      break;
    case "special":
      badgeStyle = "bg-amber-100 text-amber-800 border-amber-200";
      break;
    default:
      badgeStyle = "bg-gray-100 text-gray-800 border-gray-200";
  }

  // Namen für die Anzeige konvertieren
  let displayName;
  switch (typeId) {
    case "vacation":
      displayName = "Urlaub";
      break;
    case "sick":
      displayName = "Krank";
      break;
    case "homeoffice":
      displayName = "Homeoffice";
      break;
    case "business":
      displayName = "Dienstreise";
      break;
    case "special":
      displayName = "Sonderurlaub";
      break;
    default:
      displayName = typeName;
  }

  return (
    <Badge variant="outline" className={badgeStyle}>
      {displayName}
    </Badge>
  );
};

const AbsenceSettings: React.FC = () => {
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);

  const [settings, setSettings] = useState({
    autoApproval: false,
    notifyManager: true,
    notifyAdminDept: true,
    documentUpload: true,
    documentUploadDays: 3,
    enableReminders: true,
    reminderDays: 2,
    allowPartialDays: true,
    requireSubstitute: false,
    maxConsecutiveDays: 30,
    yearlyResetEnabled: true,
    yearlyResetDay: 1,
    yearlyResetMonth: 1,
    enforceMinAdvanceNotice: true,
    minAdvanceNoticeDays: 14,
    allowRetroactive: true,
    maxRetroactiveDays: 7,
    enforceVacationBlockout: false,
    blockoutStart: "",
    blockoutEnd: "",
    allowOverdraw: false,
    maxOverdrawDays: 5,
    enforceCancellationPolicy: true,
    cancellationDeadlineDays: 3,
    enableConflictDetection: true,
    conflictResolutionStrategy: "manual"
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="types">Abwesenheitstypen</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="approvals">Genehmigungsprozess</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="shifts">Schichtplanung</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>Konfigurieren Sie die grundlegenden Einstellungen für Abwesenheiten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatische Genehmigung</Label>
                  <p className="text-sm text-muted-foreground">Abwesenheitsanträge automatisch genehmigen</p>
                </div>
                <Switch 
                  checked={settings.autoApproval} 
                  onCheckedChange={(value) => handleSettingChange('autoApproval', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hochladen von Dokumenten erforderlich</Label>
                  <p className="text-sm text-muted-foreground">Bei bestimmten Abwesenheiten Dokumente verlangen (z.B. Krankenschein)</p>
                </div>
                <Switch 
                  checked={settings.documentUpload} 
                  onCheckedChange={(value) => handleSettingChange('documentUpload', value)} 
                />
              </div>
              
              {settings.documentUpload && (
                <div className="ml-6 border-l-2 pl-4 border-l-muted">
                  <div className="space-y-2">
                    <Label>Frist für Dokumentenupload (Tage)</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[settings.documentUploadDays]} 
                        min={1} 
                        max={14} 
                        step={1} 
                        onValueChange={([value]) => handleSettingChange('documentUploadDays', value)} 
                      />
                      <span className="w-12 text-center">{settings.documentUploadDays}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Teilzeitabwesenheiten erlauben</Label>
                  <p className="text-sm text-muted-foreground">Abwesenheiten für Teile des Tages ermöglichen</p>
                </div>
                <Switch 
                  checked={settings.allowPartialDays} 
                  onCheckedChange={(value) => handleSettingChange('allowPartialDays', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vertretung erforderlich</Label>
                  <p className="text-sm text-muted-foreground">Vertretung muss für Abwesenheit angegeben werden</p>
                </div>
                <Switch 
                  checked={settings.requireSubstitute} 
                  onCheckedChange={(value) => handleSettingChange('requireSubstitute', value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Maximale aufeinanderfolgende Abwesenheitstage</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[settings.maxConsecutiveDays]} 
                    min={1} 
                    max={90} 
                    step={1} 
                    onValueChange={([value]) => handleSettingChange('maxConsecutiveDays', value)} 
                  />
                  <span className="w-12 text-center">{settings.maxConsecutiveDays}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheitstypen</CardTitle>
              <CardDescription>Verwalten Sie die verschiedenen Arten von Abwesenheiten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {absenceTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AbsenceTypeBadge type={type} />
                      <div>
                        <p className="font-medium">{type.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Max: {type.maxDays} Tage | 
                          {type.requiresApproval ? ' Genehmigung erforderlich' : ' Keine Genehmigung erforderlich'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                ))}
              </div>
              
              <Button variant="outline">+ Neuen Abwesenheitstyp hinzufügen</Button>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
              <CardDescription>Konfigurieren Sie die Benachrichtigungseinstellungen für Abwesenheiten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vorgesetzte benachrichtigen</Label>
                  <p className="text-sm text-muted-foreground">Bei neuen Abwesenheitsanträgen</p>
                </div>
                <Switch 
                  checked={settings.notifyManager} 
                  onCheckedChange={(value) => handleSettingChange('notifyManager', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Personalabteilung benachrichtigen</Label>
                  <p className="text-sm text-muted-foreground">Bei neuen und genehmigten Abwesenheitsanträgen</p>
                </div>
                <Switch 
                  checked={settings.notifyAdminDept} 
                  onCheckedChange={(value) => handleSettingChange('notifyAdminDept', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Erinnerungen aktivieren</Label>
                  <p className="text-sm text-muted-foreground">Erinnerungen für bevorstehende Abwesenheiten senden</p>
                </div>
                <Switch 
                  checked={settings.enableReminders} 
                  onCheckedChange={(value) => handleSettingChange('enableReminders', value)} 
                />
              </div>
              
              {settings.enableReminders && (
                <div className="ml-6 border-l-2 pl-4 border-l-muted">
                  <div className="space-y-2">
                    <Label>Tage im Voraus erinnern</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[settings.reminderDays]} 
                        min={1} 
                        max={14} 
                        step={1} 
                        onValueChange={([value]) => handleSettingChange('reminderDays', value)} 
                      />
                      <span className="w-12 text-center">{settings.reminderDays}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schichtplanungs-Integration</CardTitle>
              <CardDescription>Konfigurieren Sie die Integration zwischen Abwesenheiten und der Schichtplanung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Konflikterkennung aktivieren</Label>
                  <p className="text-sm text-muted-foreground">Automatisch Konflikte mit geplanten Schichten erkennen</p>
                </div>
                <Switch 
                  checked={settings.enableConflictDetection} 
                  onCheckedChange={(value) => handleSettingChange('enableConflictDetection', value)} 
                />
              </div>
              
              {settings.enableConflictDetection && (
                <div className="ml-6 border-l-2 pl-4 border-l-muted space-y-4">
                  <div className="space-y-2">
                    <Label>Konfliktlösungsstrategie</Label>
                    <Select 
                      value={settings.conflictResolutionStrategy} 
                      onValueChange={(value) => handleSettingChange('conflictResolutionStrategy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Strategie auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manuell (Benutzer muss entscheiden)</SelectItem>
                        <SelectItem value="auto_reassign">Automatisch neu zuweisen</SelectItem>
                        <SelectItem value="cancel_shift">Schicht stornieren</SelectItem>
                        <SelectItem value="deny_absence">Abwesenheit ablehnen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Hinweis zur automatischen Konfliktlösung</AlertTitle>
                    <AlertDescription>
                      Bei aktivierter automatischer Neuzuweisung werden Schichten entsprechend der Qualifikationen und Verfügbarkeit anderer Mitarbeiter neu zugeteilt.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Abwesenheiten im Schichtkalender anzeigen</Label>
                  <p className="text-sm text-muted-foreground">Genehmigte Abwesenheiten im Schichtplanungskalender hervorheben</p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="space-y-2">
                <Label>Schichtüberlappungs-Verhalten</Label>
                <Select defaultValue="warn">
                  <SelectTrigger>
                    <SelectValue placeholder="Verhalten auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warn">Warnen und fortfahren</SelectItem>
                    <SelectItem value="block">Blockieren und ablehnen</SelectItem>
                    <SelectItem value="auto_resolve">Automatisch lösen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AbsenceSettings;
