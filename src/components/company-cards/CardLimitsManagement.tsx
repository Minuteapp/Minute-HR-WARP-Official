import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings, AlertTriangle, Save, Edit2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface LimitRule {
  id: string;
  name: string;
  department: string;
  monthlyLimit: number;
  dailyLimit: number;
  singleTransactionLimit: number;
  allowedCategories: string[];
  alertThreshold: number;
  autoBlock: boolean;
}

// Keine Mock-Daten - leerer Zustand bis echte Daten geladen werden
const initialRules: LimitRule[] = [];

export const CardLimitsManagement = () => {
  const [rules, setRules] = useState<LimitRule[]>(initialRules);
  const [editingRule, setEditingRule] = useState<LimitRule | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = (rule: LimitRule) => {
    setEditingRule({ ...rule });
    setShowEditDialog(true);
  };

  const handleSave = () => {
    if (!editingRule) return;
    
    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
    setShowEditDialog(false);
    toast.success("Limit-Regel aktualisiert");
  };

  const totalMonthlyBudget = rules.reduce((sum, r) => sum + r.monthlyLimit, 0);

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt-Budget/Monat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMonthlyBudget.toLocaleString('de-DE')} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Regeln</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Block aktiv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter(r => r.autoBlock).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Regeln-Tabelle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Limit-Regeln
            </CardTitle>
            <Button>
              Neue Regel erstellen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regelname</TableHead>
                <TableHead>Abteilung</TableHead>
                <TableHead>Monatslimit</TableHead>
                <TableHead>Tageslimit</TableHead>
                <TableHead>Einzellimit</TableHead>
                <TableHead>Alert bei</TableHead>
                <TableHead>Auto-Block</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.department}</Badge>
                  </TableCell>
                  <TableCell>{rule.monthlyLimit.toLocaleString('de-DE')} €</TableCell>
                  <TableCell>{rule.dailyLimit.toLocaleString('de-DE')} €</TableCell>
                  <TableCell>{rule.singleTransactionLimit.toLocaleString('de-DE')} €</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      {rule.alertThreshold}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.autoBlock ? "destructive" : "secondary"}>
                      {rule.autoBlock ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Limit-Regel bearbeiten</DialogTitle>
          </DialogHeader>
          
          {editingRule && (
            <div className="space-y-4">
              <div>
                <Label>Regelname</Label>
                <Input 
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Monatliches Limit (€)</Label>
                <Input 
                  type="number"
                  value={editingRule.monthlyLimit}
                  onChange={(e) => setEditingRule({ ...editingRule, monthlyLimit: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label>Tägliches Limit (€)</Label>
                <Input 
                  type="number"
                  value={editingRule.dailyLimit}
                  onChange={(e) => setEditingRule({ ...editingRule, dailyLimit: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label>Einzeltransaktions-Limit (€)</Label>
                <Input 
                  type="number"
                  value={editingRule.singleTransactionLimit}
                  onChange={(e) => setEditingRule({ ...editingRule, singleTransactionLimit: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label>Alert-Schwellwert: {editingRule.alertThreshold}%</Label>
                <Slider 
                  value={[editingRule.alertThreshold]}
                  onValueChange={([value]) => setEditingRule({ ...editingRule, alertThreshold: value })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatische Sperrung</Label>
                  <p className="text-xs text-muted-foreground">
                    Sperrt Karte bei Limit-Überschreitung
                  </p>
                </div>
                <Switch 
                  checked={editingRule.autoBlock}
                  onCheckedChange={(checked) => setEditingRule({ ...editingRule, autoBlock: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
