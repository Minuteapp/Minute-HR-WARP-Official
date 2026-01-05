
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Settings, MapPin, Euro, Calendar } from "lucide-react";
import { toast } from "sonner";

interface OvertimeRule {
  id: string;
  rule_name: string;
  rule_type: 'automatic' | 'manual' | 'threshold';
  department?: string;
  position?: string;
  employee_type?: string;
  max_daily_hours: number;
  max_weekly_hours: number;
  max_monthly_hours: number;
  compensation_type: 'payout' | 'time_off' | 'both';
  payout_multiplier: number;
  time_off_multiplier: number;
  auto_approval_threshold: number;
  requires_approval: boolean;
  is_active: boolean;
}

interface LocationSetting {
  id: string;
  location_name: string;
  country: string;
  legal_max_daily_hours: number;
  legal_max_weekly_hours: number;
  legal_max_monthly_hours: number;
  minimum_rest_hours: number;
  weekend_overtime_multiplier: number;
  holiday_overtime_multiplier: number;
  night_shift_overtime_multiplier: number;
  regulations: Record<string, any>;
  is_active: boolean;
}

const OvertimeManagement = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [overtimeRules, setOvertimeRules] = useState<OvertimeRule[]>([]);
  const [locationSettings, setLocationSettings] = useState<LocationSetting[]>([]);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<OvertimeRule>>({
    rule_name: '',
    rule_type: 'automatic',
    max_daily_hours: 8,
    max_weekly_hours: 40,
    max_monthly_hours: 160,
    compensation_type: 'payout',
    payout_multiplier: 1.5,
    time_off_multiplier: 1.0,
    auto_approval_threshold: 2.0,
    requires_approval: true,
    is_active: true
  });

  const handleSaveRule = () => {
    if (!newRule.rule_name) {
      toast.error("Regelname ist erforderlich");
      return;
    }

    // TODO: Implementiere API-Aufruf zur Speicherung
    toast.success("Überstundenregel gespeichert");
    setShowNewRuleForm(false);
    setNewRule({
      rule_name: '',
      rule_type: 'automatic',
      max_daily_hours: 8,
      max_weekly_hours: 40,
      max_monthly_hours: 160,
      compensation_type: 'payout',
      payout_multiplier: 1.5,
      time_off_multiplier: 1.0,
      auto_approval_threshold: 2.0,
      requires_approval: true,
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Überstunden-Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verwalten Sie Überstundenregeln, Vergütung und Freizeitausgleich
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Regeln
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Auszahlungen
          </TabsTrigger>
          <TabsTrigger value="time-off" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Freizeitausgleich
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Standorte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Überstundenregeln
                </CardTitle>
                <Button 
                  onClick={() => setShowNewRuleForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Neue Regel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewRuleForm && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Neue Überstundenregel erstellen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-name">Regelname</Label>
                        <Input
                          id="rule-name"
                          value={newRule.rule_name || ''}
                          onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                          placeholder="z.B. Standard Vollzeit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rule-type">Regeltyp</Label>
                        <Select 
                          value={newRule.rule_type} 
                          onValueChange={(value: 'automatic' | 'manual' | 'threshold') => 
                            setNewRule({ ...newRule, rule_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatisch</SelectItem>
                            <SelectItem value="manual">Manuell</SelectItem>
                            <SelectItem value="threshold">Schwellenwert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-daily">Max. Stunden/Tag</Label>
                        <Input
                          id="max-daily"
                          type="number"
                          value={newRule.max_daily_hours || 8}
                          onChange={(e) => setNewRule({ ...newRule, max_daily_hours: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-weekly">Max. Stunden/Woche</Label>
                        <Input
                          id="max-weekly"
                          type="number"
                          value={newRule.max_weekly_hours || 40}
                          onChange={(e) => setNewRule({ ...newRule, max_weekly_hours: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-monthly">Max. Stunden/Monat</Label>
                        <Input
                          id="max-monthly"
                          type="number"
                          value={newRule.max_monthly_hours || 160}
                          onChange={(e) => setNewRule({ ...newRule, max_monthly_hours: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Vergütung</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="compensation-type">Vergütungsart</Label>
                          <Select 
                            value={newRule.compensation_type} 
                            onValueChange={(value: 'payout' | 'time_off' | 'both') => 
                              setNewRule({ ...newRule, compensation_type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="payout">Auszahlung</SelectItem>
                              <SelectItem value="time_off">Freizeitausgleich</SelectItem>
                              <SelectItem value="both">Beides möglich</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payout-multiplier">Auszahlungsfaktor</Label>
                          <Input
                            id="payout-multiplier"
                            type="number"
                            step="0.1"
                            value={newRule.payout_multiplier || 1.5}
                            onChange={(e) => setNewRule({ ...newRule, payout_multiplier: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requires-approval"
                        checked={newRule.requires_approval || false}
                        onCheckedChange={(checked) => setNewRule({ ...newRule, requires_approval: checked })}
                      />
                      <Label htmlFor="requires-approval">Genehmigung erforderlich</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-active"
                        checked={newRule.is_active || false}
                        onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                      />
                      <Label htmlFor="is-active">Regel aktiv</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveRule}>
                        Regel speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewRuleForm(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {overtimeRules.length === 0 && !showNewRuleForm && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Keine Überstundenregeln konfiguriert</p>
                  <p className="text-sm">Erstellen Sie Ihre erste Regel, um zu beginnen.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Überstunden-Auszahlungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Euro className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Keine Auszahlungen vorhanden</p>
                <p className="text-sm">Überstunden-Auszahlungen werden hier verwaltet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-off" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Freizeitausgleich-Anfragen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Keine Freizeitausgleich-Anfragen</p>
                <p className="text-sm">Anfragen für Freizeitausgleich werden hier verwaltet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Standort-spezifische Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {['Deutschland', 'Österreich', 'Schweiz'].map((country) => (
                    <Card key={country} className="border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{country}</h4>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Aktiv
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Max. täglich:</span>
                            <p className="font-medium">
                              {country === 'Deutschland' ? '10h' : 
                               country === 'Österreich' ? '12h' : '9h'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Max. wöchentlich:</span>
                            <p className="font-medium">
                              {country === 'Deutschland' ? '48h' : 
                               country === 'Österreich' ? '50h' : '45h'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ruhezeit:</span>
                            <p className="font-medium">11h</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Wochenend-Faktor:</span>
                            <p className="font-medium">
                              {country === 'Schweiz' ? '1,25x' : '2,0x'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OvertimeManagement;
