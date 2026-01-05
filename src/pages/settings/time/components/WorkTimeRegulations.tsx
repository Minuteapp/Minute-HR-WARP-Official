
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const WorkTimeRegulations = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Arbeitszeit-Regularien wurden aktualisiert.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Gesetzliche Vorgaben</h3>
          <p className="text-sm text-gray-500">
            Einstellungen gemäß dem deutschen Arbeitszeitgesetz (ArbZG)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale tägliche Arbeitszeit</Label>
              <div className="flex">
                <Input type="number" defaultValue="10" className="rounded-r-none" />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Minimale Ruhezeit zwischen Arbeitstagen</Label>
              <div className="flex">
                <Input type="number" defaultValue="11" className="rounded-r-none" />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Maximale wöchentliche Arbeitszeit</Label>
              <div className="flex">
                <Input type="number" defaultValue="48" className="rounded-r-none" />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Mindestpausenzeit pro Tag</Label>
              <div className="flex">
                <Input type="number" defaultValue="45" className="rounded-r-none" />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Minuten
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Arbeitszeitgesetz strikt einhalten</Label>
              <p className="text-sm text-gray-500">
                Verhindert Verstöße gegen gesetzliche Vorgaben
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Pausenregelungen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Automatische Pause nach</Label>
              <div className="flex">
                <Input type="number" defaultValue="6" className="rounded-r-none" />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Pausendauer</Label>
              <div className="flex">
                <Input type="number" defaultValue="30" className="rounded-r-none" />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Minuten
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pausen automatisch abziehen</Label>
              <p className="text-sm text-gray-500">
                Pausenzeiten werden automatisch von der Arbeitszeit abgezogen
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Sonderregeln</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sonntagsarbeit erlauben</Label>
              <p className="text-sm text-gray-500">
                Gemäß §9 Arbeitszeitgesetz
              </p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Feiertagsarbeit erlauben</Label>
              <p className="text-sm text-gray-500">
                Gemäß §9 Arbeitszeitgesetz
              </p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Jugendliche Beschäftigte (JArbSchG)</Label>
              <p className="text-sm text-gray-500">
                Besondere Schutzvorschriften für Jugendliche aktivieren
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default WorkTimeRegulations;
