import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  FileText,
  Users,
  Eye
} from "lucide-react";
import { usePolicyEngine, SystemPolicy } from "@/hooks/system/usePolicyEngine";

const PolicyManager = () => {
  const { 
    policies, 
    conflicts, 
    loading, 
    createPolicy, 
    updatePolicy, 
    deletePolicy, 
    resolveConflict 
  } = usePolicyEngine();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SystemPolicy | null>(null);
  const [newPolicy, setNewPolicy] = useState({
    policy_key: '',
    policy_category: 'security' as const,
    policy_name: '',
    policy_description: '',
    is_active: true,
    policy_value: {},
    affected_modules: [] as string[],
    required_roles: [] as string[],
    priority: 1
  });

  const handleCreatePolicy = async () => {
    try {
      await createPolicy(newPolicy);
      setShowCreateDialog(false);
      setNewPolicy({
        policy_key: '',
        policy_category: 'security',
        policy_name: '',
        policy_description: '',
        is_active: true,
        policy_value: {},
        affected_modules: [],
        required_roles: [],
        priority: 1
      });
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!editingPolicy) return;
    
    try {
      await updatePolicy(editingPolicy.id, editingPolicy);
      setEditingPolicy(null);
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'timetracking': return <Clock className="h-4 w-4" />;
      case 'absence': return <Users className="h-4 w-4" />;
      case 'documents': return <FileText className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">
            Zentrale Verwaltung aller Systemrichtlinien und Sicherheitsregeln
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue Systemrichtlinie erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Policy, die systemweit durchgesetzt wird.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_key">Policy Key</Label>
                  <Input
                    id="policy_key"
                    value={newPolicy.policy_key}
                    onChange={(e) => setNewPolicy({...newPolicy, policy_key: e.target.value})}
                    placeholder="z.B. mfa_required"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie</Label>
                  <Select 
                    value={newPolicy.policy_category} 
                    onValueChange={(value: any) => setNewPolicy({...newPolicy, policy_category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Sicherheit</SelectItem>
                      <SelectItem value="timetracking">Zeiterfassung</SelectItem>
                      <SelectItem value="absence">Abwesenheiten</SelectItem>
                      <SelectItem value="documents">Dokumente</SelectItem>
                      <SelectItem value="general">Allgemein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="policy_name">Policy Name</Label>
                <Input
                  id="policy_name"
                  value={newPolicy.policy_name}
                  onChange={(e) => setNewPolicy({...newPolicy, policy_name: e.target.value})}
                  placeholder="z.B. Multi-Faktor-Authentifizierung erforderlich"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={newPolicy.policy_description}
                  onChange={(e) => setNewPolicy({...newPolicy, policy_description: e.target.value})}
                  placeholder="Beschreibung der Policy und ihrer Auswirkungen"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorität</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newPolicy.priority}
                    onChange={(e) => setNewPolicy({...newPolicy, priority: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="is_active"
                    checked={newPolicy.is_active}
                    onCheckedChange={(checked) => setNewPolicy({...newPolicy, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Aktiv</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreatePolicy}>
                Policy erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">
            <Settings className="h-4 w-4 mr-2" />
            Active Policies ({policies.filter(p => p.is_active).length})
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Konflikte ({conflicts.length})
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Eye className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {policies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Policies konfiguriert</h3>
                <p className="text-muted-foreground mb-4">
                  Erstellen Sie Ihre erste Systemrichtlinie für automatische Durchsetzung.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Policy erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(policy.policy_category)}
                        <div>
                          <CardTitle className="text-lg">{policy.policy_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {policy.policy_key}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {policy.policy_category}
                            </Badge>
                            {policy.is_active ? (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktiv
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Inaktiv
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPolicy(policy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePolicy(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {policy.policy_description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {policy.policy_description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Betroffene Module:</span>
                          <div className="mt-1">
                            {policy.affected_modules.length > 0 ? (
                              policy.affected_modules.map(module => (
                                <Badge key={module} variant="outline" className="text-xs mr-1">
                                  {module}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Alle Module</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Betroffene Rollen:</span>
                          <div className="mt-1">
                            {policy.required_roles.length > 0 ? (
                              policy.required_roles.map(role => (
                                <Badge key={role} variant="outline" className="text-xs mr-1">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Alle Rollen</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Priorität:</span>
                          <span className="ml-2 font-mono">{policy.priority}</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {conflicts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Konflikte erkannt</h3>
                <p className="text-muted-foreground">
                  Alle aktiven Policies sind konsistent und konfliktfrei.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {conflicts.map((conflict) => (
                <Card key={conflict.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <CardTitle className="text-lg text-red-800">
                            Policy-Konflikt erkannt
                          </CardTitle>
                          <Badge className={`text-xs ${getSeverityColor(conflict.severity)}`}>
                            {conflict.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => resolveConflict(conflict.id, 'Manuell gelöst')}
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Lösen
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Konflikttyp:</strong> {conflict.conflict_type}
                    </p>
                    <p className="text-sm">
                      {conflict.conflict_description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Policy Enforcement Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Audit-Logs werden hier angezeigt (in Entwicklung).
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Policy Dialog */}
      {editingPolicy && (
        <Dialog open={!!editingPolicy} onOpenChange={() => setEditingPolicy(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Policy bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die Einstellungen für "{editingPolicy.policy_name}".
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_policy_name">Policy Name</Label>
                <Input
                  id="edit_policy_name"
                  value={editingPolicy.policy_name}
                  onChange={(e) => setEditingPolicy({
                    ...editingPolicy, 
                    policy_name: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Beschreibung</Label>
                <Textarea
                  id="edit_description"
                  value={editingPolicy.policy_description || ''}
                  onChange={(e) => setEditingPolicy({
                    ...editingPolicy, 
                    policy_description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={editingPolicy.is_active}
                  onCheckedChange={(checked) => setEditingPolicy({
                    ...editingPolicy, 
                    is_active: checked
                  })}
                />
                <Label htmlFor="edit_is_active">Policy aktiv</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPolicy(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleUpdatePolicy}>
                Änderungen speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PolicyManager;