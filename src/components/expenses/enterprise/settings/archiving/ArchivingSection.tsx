
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

const ArchivingSection = () => {
  const [retentionPeriod, setRetentionPeriod] = useState('10years');
  const [archiveAfter, setArchiveAfter] = useState('30days');

  return (
    <div className="space-y-6">
      {/* Archivierungsregeln */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Archivierungsregeln</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="retentionPeriod">Aufbewahrungsfrist</Label>
              <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                <SelectTrigger id="retentionPeriod" className="bg-background">
                  <SelectValue placeholder="Frist wählen" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="10years">10 Jahre (gesetzlich vorgeschrieben)</SelectItem>
                  <SelectItem value="7years">7 Jahre</SelectItem>
                  <SelectItem value="5years">5 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="archiveAfter">Archivierung nach</Label>
              <Select value={archiveAfter} onValueChange={setArchiveAfter}>
                <SelectTrigger id="archiveAfter" className="bg-background">
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="30days">30 Tage nach Buchungsperioden-Abschluss</SelectItem>
                  <SelectItem value="60days">60 Tage nach Buchungsperioden-Abschluss</SelectItem>
                  <SelectItem value="90days">90 Tage nach Buchungsperioden-Abschluss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hinweis-Box */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-foreground">
              <strong>Hinweis:</strong> Archivierte Daten werden verschlüsselt gespeichert und können nicht mehr bearbeitet werden. Die automatische Löschung erfolgt nach Ablauf der Aufbewahrungsfrist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivingSection;
