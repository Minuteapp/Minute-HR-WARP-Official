
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Edit, Trash, Plus, Briefcase, HeartPulse, Gift, User 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AbsenceRule {
  id: string;
  type: 'vacation' | 'sick_leave' | 'special_leave';
  typeName: string;
  max_days: number;
  approval_process: string;
  carryover_rules?: string;
  notification_rules?: string;
  attestation_rules?: string;
  salary_continuation?: string;
}

const AbsenceRules = () => {
  const [rules, setRules] = useState<AbsenceRule[]>([
    {
      id: '1',
      type: 'vacation',
      typeName: 'Urlaub',
      max_days: 30,
      approval_process: 'Genehmigung durch Vorgesetzten',
      carryover_rules: 'Übertrag von max. 5 Tagen ins nächste Jahr',
      notification_rules: 'Mindestens 2 Wochen vorher beantragen',
    },
    {
      id: '2',
      type: 'sick_leave',
      typeName: 'Krankmeldung',
      max_days: 42,
      approval_process: 'Automatische Genehmigung',
      attestation_rules: 'Attest ab dem 3. Tag',
      salary_continuation: '100% für bis zu 6 Wochen',
      notification_rules: 'Sofortige Benachrichtigung am ersten Tag',
    },
    {
      id: '3',
      type: 'special_leave',
      typeName: 'Sonderurlaub',
      max_days: 10,
      approval_process: 'Genehmigung durch Personalabteilung',
      notification_rules: 'Individuell je nach Anlass',
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentRule, setCurrentRule] = useState<AbsenceRule | null>(null);
  const [newRule, setNewRule] = useState<Omit<AbsenceRule, 'id'>>({
    type: 'vacation',
    typeName: 'Urlaub',
    max_days: 0,
    approval_process: '',
    carryover_rules: '',
    notification_rules: '',
    attestation_rules: '',
    salary_continuation: ''
  });

  const handleAddRule = () => {
    const id = Date.now().toString();
    setRules([...rules, { id, ...newRule }]);
    setNewRule({
      type: 'vacation',
      typeName: 'Urlaub',
      max_days: 0,
      approval_process: '',
      carryover_rules: '',
      notification_rules: '',
      attestation_rules: '',
      salary_continuation: ''
    });
    setShowAddDialog(false);
  };

  const handleEditRule = () => {
    if (currentRule) {
      setRules(rules.map(rule => 
        rule.id === currentRule.id ? currentRule : rule
      ));
      setShowEditDialog(false);
    }
  };

  const handleDeleteRule = () => {
    if (currentRule) {
      setRules(rules.filter(rule => rule.id !== currentRule.id));
      setShowDeleteDialog(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'vacation':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'sick_leave':
        return <HeartPulse className="h-5 w-5 text-red-500" />;
      case 'special_leave':
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Briefcase className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleTypeChange = (value: string, isNew = false) => {
    const typeNames: Record<string, string> = {
      'vacation': 'Urlaub',
      'sick_leave': 'Krankmeldung',
      'special_leave': 'Sonderurlaub'
    };
    
    if (isNew) {
      setNewRule({
        ...newRule,
        type: value as 'vacation' | 'sick_leave' | 'special_leave',
        typeName: typeNames[value]
      });
    } else if (currentRule) {
      setCurrentRule({
        ...currentRule,
        type: value as 'vacation' | 'sick_leave' | 'special_leave',
        typeName: typeNames[value]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Abwesenheitsregeln</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Regel hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map(rule => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center">
                {getIconForType(rule.type)}
                <span className="ml-2">{rule.typeName}</span>
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentRule(rule);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentRule(rule);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Maximale Tage</p>
                  <p>{rule.max_days} Tage</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Genehmigungsprozess</p>
                  <p>{rule.approval_process}</p>
                </div>
                {rule.carryover_rules && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Übertragungsregeln</p>
                    <p>{rule.carryover_rules}</p>
                  </div>
                )}
                {rule.notification_rules && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Benachrichtigungspflicht</p>
                    <p>{rule.notification_rules}</p>
                  </div>
                )}
                {rule.attestation_rules && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Attestpflicht</p>
                    <p>{rule.attestation_rules}</p>
                  </div>
                )}
                {rule.salary_continuation && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lohnfortzahlung</p>
                    <p>{rule.salary_continuation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog für neue Regel */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Neue Abwesenheitsregel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Typ</Label>
              <Select 
                value={newRule.type} 
                onValueChange={(value) => handleTypeChange(value, true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                  <SelectItem value="special_leave">Sonderurlaub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max_days">Maximale Tage</Label>
              <Input
                id="max_days"
                type="number"
                value={newRule.max_days}
                onChange={(e) => setNewRule({...newRule, max_days: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="approval_process">Genehmigungsprozess</Label>
              <Textarea
                id="approval_process"
                value={newRule.approval_process}
                onChange={(e) => setNewRule({...newRule, approval_process: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notification_rules">Benachrichtigungspflicht</Label>
              <Textarea
                id="notification_rules"
                value={newRule.notification_rules}
                onChange={(e) => setNewRule({...newRule, notification_rules: e.target.value})}
              />
            </div>
            {newRule.type === 'vacation' && (
              <div className="grid gap-2">
                <Label htmlFor="carryover_rules">Übertragungsregeln</Label>
                <Textarea
                  id="carryover_rules"
                  value={newRule.carryover_rules}
                  onChange={(e) => setNewRule({...newRule, carryover_rules: e.target.value})}
                  placeholder="z.B. Übertrag von max. 5 Tagen ins nächste Jahr"
                />
              </div>
            )}
            {newRule.type === 'sick_leave' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="attestation_rules">Attestpflicht</Label>
                  <Textarea
                    id="attestation_rules"
                    value={newRule.attestation_rules}
                    onChange={(e) => setNewRule({...newRule, attestation_rules: e.target.value})}
                    placeholder="z.B. Attest ab dem 3. Tag"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salary_continuation">Lohnfortzahlung</Label>
                  <Textarea
                    id="salary_continuation"
                    value={newRule.salary_continuation}
                    onChange={(e) => setNewRule({...newRule, salary_continuation: e.target.value})}
                    placeholder="z.B. 100% für bis zu 6 Wochen"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Abbrechen</Button>
            <Button onClick={handleAddRule}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zum Bearbeiten */}
      {currentRule && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Abwesenheitsregel bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Typ</Label>
                <Select 
                  value={currentRule.type} 
                  onValueChange={(value) => handleTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Urlaub</SelectItem>
                    <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                    <SelectItem value="special_leave">Sonderurlaub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-max_days">Maximale Tage</Label>
                <Input
                  id="edit-max_days"
                  type="number"
                  value={currentRule.max_days}
                  onChange={(e) => setCurrentRule({...currentRule, max_days: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-approval_process">Genehmigungsprozess</Label>
                <Textarea
                  id="edit-approval_process"
                  value={currentRule.approval_process}
                  onChange={(e) => setCurrentRule({...currentRule, approval_process: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notification_rules">Benachrichtigungspflicht</Label>
                <Textarea
                  id="edit-notification_rules"
                  value={currentRule.notification_rules}
                  onChange={(e) => setCurrentRule({...currentRule, notification_rules: e.target.value})}
                />
              </div>
              {currentRule.type === 'vacation' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-carryover_rules">Übertragungsregeln</Label>
                  <Textarea
                    id="edit-carryover_rules"
                    value={currentRule.carryover_rules}
                    onChange={(e) => setCurrentRule({...currentRule, carryover_rules: e.target.value})}
                  />
                </div>
              )}
              {currentRule.type === 'sick_leave' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-attestation_rules">Attestpflicht</Label>
                    <Textarea
                      id="edit-attestation_rules"
                      value={currentRule.attestation_rules}
                      onChange={(e) => setCurrentRule({...currentRule, attestation_rules: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-salary_continuation">Lohnfortzahlung</Label>
                    <Textarea
                      id="edit-salary_continuation"
                      value={currentRule.salary_continuation}
                      onChange={(e) => setCurrentRule({...currentRule, salary_continuation: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Abbrechen</Button>
              <Button onClick={handleEditRule}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog zum Löschen */}
      {currentRule && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Abwesenheitsregel löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Möchten Sie die Abwesenheitsregel "{currentRule.typeName}" wirklich löschen?</p>
              <p className="text-red-500 text-sm mt-2">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Abbrechen</Button>
              <Button variant="destructive" onClick={handleDeleteRule}>Löschen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AbsenceRules;
