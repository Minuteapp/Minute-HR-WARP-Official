import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Shield
} from 'lucide-react';
import PolicyAwareComponent from '@/components/system/PolicyAwareComponent';
import { usePolicyEnforcement } from '@/hooks/system/usePolicyEnforcement';

interface AbsenceRequestData {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  halfDay: boolean;
}

const PolicyAwareAbsenceRequest = () => {
  const { guards } = usePolicyEnforcement();
  const [formData, setFormData] = useState<AbsenceRequestData>({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false
  });
  const [policyValidation, setPolicyValidation] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Policy Context für Abwesenheitsanträge
  const policyContext = {
    absence_type: formData.type,
    start_date: formData.startDate,
    end_date: formData.endDate,
    duration_days: calculateDuration(formData.startDate, formData.endDate),
    advance_notice_days: calculateAdvanceNotice(formData.startDate),
    is_half_day: formData.halfDay
  };

  function calculateDuration(start: string, end: string): number {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  function calculateAdvanceNotice(start: string): number {
    if (!start) return 0;
    const startDate = new Date(start);
    const today = new Date();
    return Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const validatePolicyCompliance = async () => {
    const canCreate = await guards.canCreateAbsenceRequest(policyContext);
    
    const validation = {
      allowed: canCreate,
      warnings: [] as string[],
      requirements: [] as string[]
    };

    // Prüfe Vorlaufzeit (14 Tage Policy)
    if (policyContext.advance_notice_days < 14) {
      validation.warnings.push(`Mindestens 14 Tage Vorlaufzeit erforderlich (aktuell: ${policyContext.advance_notice_days} Tage)`);
    }

    // Prüfe Dauer für HR-Genehmigung
    if (policyContext.duration_days > 10) {
      validation.requirements.push('HR-Genehmigung erforderlich bei mehr als 10 Tagen');
    }

    // Prüfe Manager-Genehmigung
    validation.requirements.push('Manager-Genehmigung erforderlich');

    setPolicyValidation(validation);
    return validation;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const validation = await validatePolicyCompliance();
    
    if (validation.allowed) {
      console.log('Abwesenheitsantrag wird erstellt mit Policy-Kontext:', policyContext);
      // Hier würde der eigentliche API-Call erfolgen
      setTimeout(() => {
        setIsSubmitting(false);
        alert('Abwesenheitsantrag erfolgreich eingereicht!');
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <PolicyAwareComponent 
      moduleName="absence" 
      requiredActions={['create_request']}
      context={policyContext}
      showStatus={true}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Neuer Abwesenheitsantrag
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Abwesenheitstyp */}
            <div className="space-y-2">
              <Label htmlFor="absence-type">Abwesenheitstyp</Label>
              <Select value={formData.type} onValueChange={(value) => 
                setFormData({...formData, type: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Abwesenheitstyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                  <SelectItem value="personal_leave">Sonderurlaub</SelectItem>
                  <SelectItem value="training">Fortbildung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zeitraum */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Startdatum</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Enddatum</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            {/* Begründung */}
            <div className="space-y-2">
              <Label htmlFor="reason">Begründung</Label>
              <Textarea
                id="reason"
                placeholder="Grund für die Abwesenheit..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
              />
            </div>

            {/* Berechnung und Validation */}
            {formData.startDate && formData.endDate && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dauer:</span>
                    <p className="font-medium">{policyContext.duration_days} Tage</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vorlaufzeit:</span>
                    <p className="font-medium">{policyContext.advance_notice_days} Tage</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Typ:</span>
                    <p className="font-medium">{formData.type || 'Nicht ausgewählt'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Policy Validation Results */}
            {policyValidation && (
              <div className="space-y-3">
                {/* Warnings */}
                {policyValidation.warnings.length > 0 && (
                  <Alert className="border-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Policy-Warnungen</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {policyValidation.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Requirements */}
                {policyValidation.requirements.length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Genehmigungsanforderungen</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {policyValidation.requirements.map((req: string, index: number) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.type || !formData.startDate || !formData.endDate}
              className="w-full"
            >
              {isSubmitting ? 'Wird eingereicht...' : 'Antrag einreichen'}
            </Button>
          </CardContent>
        </Card>

        {/* Aktive Workflow-Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Aktive Genehmigungsrichtlinien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Mindest-Vorlaufzeit: 14 Tage</span>
                </div>
                <Badge className="bg-red-100 text-red-800">Aktiv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Manager-Genehmigung erforderlich</span>
                </div>
                <Badge className="bg-red-100 text-red-800">Aktiv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">HR-Genehmigung ab 10 Tagen</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Bedingt</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PolicyAwareComponent>
  );
};

export default PolicyAwareAbsenceRequest;