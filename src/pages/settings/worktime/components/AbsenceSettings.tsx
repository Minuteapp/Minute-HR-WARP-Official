
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type AbsenceType = {
  id: string;
  name: string;
  requiresApproval: boolean;
  maxDays: number;
  color: string;
}

const AbsenceTypeBadge = ({ type }: { type: AbsenceType }) => {
  // Stil basierend auf dem Typ festlegen
  let badgeStyle = "";
  
  switch (type.id) {
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

  return (
    <Badge variant="outline" className={badgeStyle}>
      {type.name}
    </Badge>
  );
};

const AbsenceSettings = () => {
  const { toast } = useToast();
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([
    { id: "vacation", name: "Urlaub", requiresApproval: true, maxDays: 30, color: "blue" },
    { id: "sick", name: "Krank", requiresApproval: false, maxDays: 365, color: "red" },
    { id: "homeoffice", name: "Homeoffice", requiresApproval: true, maxDays: 100, color: "green" },
    { id: "business", name: "Dienstreise", requiresApproval: true, maxDays: 50, color: "purple" },
    { id: "special", name: "Sonderurlaub", requiresApproval: true, maxDays: 10, color: "amber" },
  ]);

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
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Abwesenheitseinstellungen wurden erfolgreich aktualisiert."
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Abwesenheitstypen</h3>
          <p className="text-sm text-gray-500">
            Verwalten Sie die verschiedenen Arten von Abwesenheiten
          </p>
          
          <div className="grid gap-4">
            {absenceTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AbsenceTypeBadge type={type} />
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-gray-500">
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
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Allgemeine Einstellungen</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Genehmigung</Label>
              <p className="text-sm text-gray-500">Abwesenheitsanträge automatisch genehmigen</p>
            </div>
            <Switch 
              checked={settings.autoApproval} 
              onCheckedChange={(value) => handleSettingChange('autoApproval', value)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hochladen von Dokumenten erforderlich</Label>
              <p className="text-sm text-gray-500">Bei bestimmten Abwesenheiten Dokumente verlangen (z.B. Krankenschein)</p>
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
                <Input 
                  type="number"
                  min="1"
                  max="14"
                  value={settings.documentUploadDays} 
                  onChange={(e) => handleSettingChange('documentUploadDays', Number(e.target.value))} 
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Teilzeitabwesenheiten erlauben</Label>
              <p className="text-sm text-gray-500">Abwesenheiten für Teile des Tages ermöglichen</p>
            </div>
            <Switch 
              checked={settings.allowPartialDays} 
              onCheckedChange={(value) => handleSettingChange('allowPartialDays', value)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vertretung erforderlich</Label>
              <p className="text-sm text-gray-500">Vertretung muss für Abwesenheit angegeben werden</p>
            </div>
            <Switch 
              checked={settings.requireSubstitute} 
              onCheckedChange={(value) => handleSettingChange('requireSubstitute', value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Maximale aufeinanderfolgende Abwesenheitstage</Label>
            <Input 
              type="number" 
              value={settings.maxConsecutiveDays}
              onChange={(e) => handleSettingChange('maxConsecutiveDays', Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Benachrichtigungen</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vorgesetzte benachrichtigen</Label>
              <p className="text-sm text-gray-500">Bei neuen Abwesenheitsanträgen</p>
            </div>
            <Switch 
              checked={settings.notifyManager} 
              onCheckedChange={(value) => handleSettingChange('notifyManager', value)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Personalabteilung benachrichtigen</Label>
              <p className="text-sm text-gray-500">Bei neuen und genehmigten Abwesenheitsanträgen</p>
            </div>
            <Switch 
              checked={settings.notifyAdminDept} 
              onCheckedChange={(value) => handleSettingChange('notifyAdminDept', value)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Erinnerungen aktivieren</Label>
              <p className="text-sm text-gray-500">Erinnerungen für bevorstehende Abwesenheiten senden</p>
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
                <Input 
                  type="number"
                  min="1"
                  max="14"
                  value={settings.reminderDays} 
                  onChange={(e) => handleSettingChange('reminderDays', Number(e.target.value))} 
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Jahreswechsel</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Jährlicher Zurücksetzungszeitpunkt</Label>
              <p className="text-sm text-gray-500">Wann sollen Urlaubstage zurückgesetzt werden</p>
            </div>
            <Switch 
              checked={settings.yearlyResetEnabled} 
              onCheckedChange={(value) => handleSettingChange('yearlyResetEnabled', value)} 
            />
          </div>
          
          {settings.yearlyResetEnabled && (
            <div className="ml-6 border-l-2 pl-4 border-l-muted">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="31"
                    value={settings.yearlyResetDay} 
                    onChange={(e) => handleSettingChange('yearlyResetDay', Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monat</Label>
                  <Select 
                    value={settings.yearlyResetMonth.toString()}
                    onValueChange={(value) => handleSettingChange('yearlyResetMonth', Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Monat wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Januar</SelectItem>
                      <SelectItem value="2">Februar</SelectItem>
                      <SelectItem value="3">März</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">Mai</SelectItem>
                      <SelectItem value="6">Juni</SelectItem>
                      <SelectItem value="7">Juli</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">Oktober</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">Dezember</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default AbsenceSettings;
