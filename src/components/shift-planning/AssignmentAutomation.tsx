import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Settings, Trash2 } from 'lucide-react';

const employees: string[] = [];

const automationRules: { id: string; name: string; priority: string; active: boolean; conditions: string[]; actions: string[] }[] = [];

export const AssignmentAutomation = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [ruleName, setRuleName] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [conditions, setConditions] = useState('');
  const [actions, setActions] = useState('');

  const handleCreateRule = () => {
    // Create rule logic here
    setShowCreateDialog(false);
    // Reset form
    setRuleName('');
    setShiftType('');
    setDateRange({ from: '', to: '' });
    setConditions('');
    setActions('');
    setSelectedEmployees([]);
  };

  const toggleRule = (ruleId: string, active: boolean) => {
    // Toggle rule logic here
    console.log(`Toggle rule ${ruleId} to ${active}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <span className="text-blue-800 text-sm font-medium">Preview</span>
        </div>
        <h2 className="text-lg font-semibold">Zuweisung & Automatisierung</h2>
      </div>

      {/* Batch Assignment */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
            <span className="text-white text-sm">👥</span>
          </div>
          <h3 className="text-base font-medium">Batch-Zuweisung</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium">Mitarbeiter auswählen</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{employee}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {selectedEmployees.length} Mitarbeiter ausgewählt
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Schichttyp</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Schichttyp auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frueh">Frühschicht</SelectItem>
                <SelectItem value="spaet">Spätschicht</SelectItem>
                <SelectItem value="nacht">Nachtschicht</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <Label className="text-sm font-medium">Von</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Bis</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        <Button className="mt-4 w-full" disabled>
          <Settings className="w-4 h-4 mr-2" />
          Batch-Zuweisung ausführen
        </Button>
      </Card>

      {/* Automation Rules */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-sm">⚙️</span>
            </div>
            <h3 className="text-base font-medium">Automatisierungsregeln</h3>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-black text-white">
            <Plus className="w-4 h-4 mr-2" />
            Neue Regel erstellen
          </Button>
        </div>

        <div className="space-y-4">
          {automationRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Switch 
                      checked={rule.active} 
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    />
                    <h4 className="font-medium text-sm">{rule.name}</h4>
                    <Badge variant={rule.active ? "default" : "secondary"} className="text-xs">
                      {rule.active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{rule.priority}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-700">Bedingungen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-gray-700">Aktionen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    Bearbeiten
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-gray-600">📋</span>
          </div>
          <h3 className="font-medium text-sm mb-2">Alle Lücken füllen</h3>
          <Button variant="outline" size="sm" className="w-full">
            Ausführen
          </Button>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-gray-600">👥</span>
          </div>
          <h3 className="font-medium text-sm mb-2">Backup zuweisen</h3>
          <Button variant="outline" size="sm" className="w-full">
            Ausführen
          </Button>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-gray-600">⚠️</span>
          </div>
          <h3 className="font-medium text-sm mb-2">Konflikte lösen</h3>
          <Button variant="outline" size="sm" className="w-full">
            Ausführen
          </Button>
        </Card>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Automatisierungsregel erstellen</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-4 top-4"
              onClick={() => setShowCreateDialog(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-600">
              Erstellen Sie eine neue Regel für automatische Schicht-Zuweisungen.
            </p>
            
            <div>
              <Label className="text-sm font-medium">Regelname</Label>
              <Input 
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="z.B. Wochenend-Backup"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Bedingungen (eine pro Zeile)</Label>
                <Textarea 
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="z.B.&#10;Wochenende&#10;Weniger als 3 Mitarbeiter"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Aktionen (eine pro Zeile)</Label>
                <Textarea 
                  value={actions}
                  onChange={(e) => setActions(e.target.value)}
                  placeholder="z.B.&#10;Backup-Team aktivieren&#10;Manager benachrichtigen"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={handleCreateRule}
              className="w-full bg-black text-white"
              disabled={!ruleName || !conditions || !actions}
            >
              Regel erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};