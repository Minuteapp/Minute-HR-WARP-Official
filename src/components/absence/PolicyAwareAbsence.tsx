import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, FileCheck, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import PolicyAwareComponent from '@/components/system/PolicyAwareComponent';
import { usePolicyEnforcement } from '@/hooks/system/usePolicyEnforcement';

const PolicyAwareAbsence = () => {
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
  const [absenceType, setAbsenceType] = useState('vacation');
  const [reason, setReason] = useState('');
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const { guards } = usePolicyEnforcement();

  const handleCreateRequest = async () => {
    const canCreate = await guards.canCreateAbsenceRequest({
      absence_type: absenceType,
      days: calculateDays(),
      advance_notice_days: calculateAdvanceNotice(),
      document_provided: documentUploaded
    });

    if (canCreate) {
      // Erstelle Abwesenheitsantrag
      console.log('Abwesenheitsantrag erstellt');
    }
  };

  const calculateDays = () => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    const start = new Date(selectedDates.start);
    const end = new Date(selectedDates.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
  };

  const calculateAdvanceNotice = () => {
    if (!selectedDates.start) return 0;
    const start = new Date(selectedDates.start);
    const today = new Date();
    return Math.ceil((start.getTime() - today.getTime()) / (1000 * 3600 * 24));
  };

  const days = calculateDays();
  const advanceNotice = calculateAdvanceNotice();
  const requiresManagerApproval = days > 0;
  const requiresHRApproval = days > 10;
  const requiresAdvanceNotice = advanceNotice >= 14;
  const requiresDocument = absenceType === 'sick' && days >= 3;

  return (
    <PolicyAwareComponent 
      moduleName="absence" 
      requiredActions={['access', 'create_request']}
      showStatus={true}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Abwesenheitsantrag</h1>
          <Badge variant="outline">
            <Calendar className="h-4 w-4 mr-1" />
            Neuer Antrag
          </Badge>
        </div>

        {/* Policy Requirements Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Genehmigungsworkflow & Richtlinien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Erforderliche Genehmigungen:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Manager-Genehmigung
                    </span>
                    {requiresManagerApproval ? (
                      <Badge className="bg-orange-100 text-orange-800">Erforderlich</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Nicht erforderlich</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      HR-Genehmigung (&gt;10 Tage)
                    </span>
                    {requiresHRApproval ? (
                      <Badge className="bg-red-100 text-red-800">Erforderlich</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Nicht erforderlich</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Compliance-Anforderungen:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Vorlaufzeit (min. 14 Tage)
                    </span>
                    {requiresAdvanceNotice ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {advanceNotice} Tage
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Zu kurz ({advanceNotice} Tage)
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Ärztliches Attest (ab 3 Tage)
                    </span>
                    {requiresDocument ? (
                      documentUploaded ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Hochgeladen
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Erforderlich</Badge>
                      )
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Nicht erforderlich</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Warnings */}
        {(!requiresAdvanceNotice || (requiresDocument && !documentUploaded)) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Policy-Anforderungen nicht erfüllt</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <ul className="list-disc list-inside space-y-1 mt-2">
                {!requiresAdvanceNotice && (
                  <li>Mindest-Vorlaufzeit von 14 Tagen nicht eingehalten ({advanceNotice} Tage)</li>
                )}
                {requiresDocument && !documentUploaded && (
                  <li>Ärztliches Attest bei Krankheit über 3 Tage erforderlich</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Absence Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Antragsdetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Beginn</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={selectedDates.start}
                  onChange={(e) => setSelectedDates({...selectedDates, start: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Ende</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={selectedDates.end}
                  onChange={(e) => setSelectedDates({...selectedDates, end: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="absence-type">Art der Abwesenheit</Label>
              <select
                id="absence-type"
                className="w-full p-2 border rounded-md"
                value={absenceType}
                onChange={(e) => setAbsenceType(e.target.value)}
              >
                <option value="vacation">Urlaub</option>
                <option value="sick">Krankheit</option>
                <option value="personal">Persönlicher Tag</option>
                <option value="training">Fortbildung</option>
                <option value="business">Geschäftsreise</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Grund (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Zusätzliche Informationen zum Abwesenheitsgrund"
                rows={3}
              />
            </div>

            {requiresDocument && (
              <div className="space-y-2">
                <Label>Ärztliches Attest</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {documentUploaded ? (
                    <div className="text-green-600">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Attest hochgeladen</p>
                    </div>
                  ) : (
                    <div>
                      <FileCheck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Ärztliches Attest für Krankheit über 3 Tage erforderlich
                      </p>
                      <Button 
                        className="mt-2" 
                        onClick={() => setDocumentUploaded(true)}
                        size="sm"
                      >
                        Dokument hochladen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {days > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Antrags-Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Zeitraum:</p>
                  <p className="text-blue-800">{days} Tag{days !== 1 ? 'e' : ''}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Vorlaufzeit:</p>
                  <p className="text-blue-800">{advanceNotice} Tage</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Genehmigungsschritte:</p>
                  <p className="text-blue-800">
                    {requiresManagerApproval && requiresHRApproval ? '1. Manager → 2. HR' :
                     requiresManagerApproval ? '1. Manager' : 'Keine'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleCreateRequest}
            disabled={!selectedDates.start || !selectedDates.end || (requiresDocument && !documentUploaded)}
            size="lg"
          >
            Antrag einreichen
          </Button>
        </div>
      </div>
    </PolicyAwareComponent>
  );
};

export default PolicyAwareAbsence;