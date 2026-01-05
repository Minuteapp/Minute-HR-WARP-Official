import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gift, Star, ShoppingBag, Heart, Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface RewardsFormState {
  // Punktesystem
  monthly_budget: number;
  points_expiry_months: number;
  self_reward_allowed: boolean;
  points_carryover: boolean;
  // Anerkennung
  anniversary_recognition: boolean;
  birthday_recognition: boolean;
  public_recognition: boolean;
  // Reward-Typen (als JSON)
  reward_types: Array<{ id: string; name: string; points: number }>;
  // Katalog
  catalog_enabled: boolean;
  min_points_to_redeem: number;
}

export default function RewardsSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('rewards');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<RewardsFormState>({
    monthly_budget: 100,
    points_expiry_months: 12,
    self_reward_allowed: false,
    points_carryover: true,
    anniversary_recognition: true,
    birthday_recognition: true,
    public_recognition: true,
    reward_types: [
      { id: "1", name: "Danke", points: 10 },
      { id: "2", name: "Großartige Arbeit", points: 25 },
      { id: "3", name: "Überdurchschnittlich", points: 50 },
      { id: "4", name: "Herausragend", points: 100 },
    ],
    catalog_enabled: true,
    min_points_to_redeem: 50,
  });

  // Sync settings from DB
  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        monthly_budget: getValue('monthly_budget', prev.monthly_budget),
        points_expiry_months: getValue('points_expiry_months', prev.points_expiry_months),
        self_reward_allowed: getValue('self_reward_allowed', prev.self_reward_allowed),
        points_carryover: getValue('points_carryover', prev.points_carryover),
        anniversary_recognition: getValue('anniversary_recognition', prev.anniversary_recognition),
        birthday_recognition: getValue('birthday_recognition', prev.birthday_recognition),
        public_recognition: getValue('public_recognition', prev.public_recognition),
        reward_types: getValue('reward_types', prev.reward_types),
        catalog_enabled: getValue('catalog_enabled', prev.catalog_enabled),
        min_points_to_redeem: getValue('min_points_to_redeem', prev.min_points_to_redeem),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof RewardsFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const updateRewardType = (id: string, field: 'name' | 'points', value: string | number) => {
    setFormState(prev => ({
      ...prev,
      reward_types: prev.reward_types.map(rt => 
        rt.id === id ? { ...rt, [field]: value } : rt
      ),
    }));
  };

  const addRewardType = () => {
    const newId = String(Date.now());
    setFormState(prev => ({
      ...prev,
      reward_types: [...prev.reward_types, { id: newId, name: "Neuer Typ", points: 10 }],
    }));
  };

  const removeRewardType = (id: string) => {
    setFormState(prev => ({
      ...prev,
      reward_types: prev.reward_types.filter(rt => rt.id !== id),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Rewards-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Rewards-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Prämien und Anerkennung</p>
          </div>
        </div>
        <Tabs defaultValue="types" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Reward-Typen
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Punktesystem
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Prämien-Katalog
            </TabsTrigger>
            <TabsTrigger value="recognition" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Anerkennung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reward-Typen</CardTitle>
                <CardDescription>Definieren Sie verschiedene Anerkennungsarten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.reward_types.map((type) => (
                  <div key={type.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      value={type.name} 
                      className="flex-1"
                      onChange={(e) => updateRewardType(type.id, 'name', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Punkte:</span>
                      <Input 
                        type="number" 
                        value={type.points} 
                        className="w-20"
                        onChange={(e) => updateRewardType(type.id, 'points', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeRewardType(type.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addRewardType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Typ hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Punktesystem</CardTitle>
                <CardDescription>Konfigurieren Sie das Punktevergabe-System</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monatliches Punkte-Budget pro Mitarbeiter</Label>
                    <Input 
                      type="number" 
                      value={formState.monthly_budget}
                      onChange={(e) => updateFormState('monthly_budget', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Punkte-Verfall nach (Monaten)</Label>
                    <Input 
                      type="number" 
                      value={formState.points_expiry_months}
                      onChange={(e) => updateFormState('points_expiry_months', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Selbst-Vergabe erlauben</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können sich selbst belohnen</p>
                  </div>
                  <Switch 
                    checked={formState.self_reward_allowed}
                    onCheckedChange={(checked) => updateFormState('self_reward_allowed', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Punkte-Übertrag</Label>
                    <p className="text-sm text-muted-foreground">Nicht genutzte Punkte übertragen</p>
                  </div>
                  <Switch 
                    checked={formState.points_carryover}
                    onCheckedChange={(checked) => updateFormState('points_carryover', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prämien-Katalog</CardTitle>
                <CardDescription>Verfügbare Prämien zum Einlösen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Katalog aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Prämien-Shop für Mitarbeiter</p>
                  </div>
                  <Switch 
                    checked={formState.catalog_enabled}
                    onCheckedChange={(checked) => updateFormState('catalog_enabled', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mindestpunkte zum Einlösen</Label>
                  <Input 
                    type="number" 
                    value={formState.min_points_to_redeem}
                    onChange={(e) => updateFormState('min_points_to_redeem', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="text-center py-8 text-muted-foreground border-t">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Prämien konfiguriert</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Prämie hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recognition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anerkennungsregeln</CardTitle>
                <CardDescription>Automatische Anerkennungen konfigurieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jubiläums-Anerkennung</Label>
                    <p className="text-sm text-muted-foreground">Automatisch bei Firmenjubiläen</p>
                  </div>
                  <Switch 
                    checked={formState.anniversary_recognition}
                    onCheckedChange={(checked) => updateFormState('anniversary_recognition', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Geburtstags-Anerkennung</Label>
                    <p className="text-sm text-muted-foreground">Automatisch zum Geburtstag</p>
                  </div>
                  <Switch 
                    checked={formState.birthday_recognition}
                    onCheckedChange={(checked) => updateFormState('birthday_recognition', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Öffentliche Anerkennung</Label>
                    <p className="text-sm text-muted-foreground">Im Unternehmens-Feed anzeigen</p>
                  </div>
                  <Switch 
                    checked={formState.public_recognition}
                    onCheckedChange={(checked) => updateFormState('public_recognition', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
