import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gift, Plus, Pencil, Trash2, UtensilsCrossed, Train, Dumbbell, PiggyBank, Baby, Tag } from "lucide-react";
import { toast } from "sonner";

interface BenefitTemplate {
  id: string;
  name: string;
  type: string;
  category: string | null;
  description: string | null;
  default_amount: number | null;
  max_amount: number | null;
  tax_treatment: string | null;
  legal_reference: string | null;
  is_active: boolean;
  settings: Record<string, unknown>;
}

const typeLabels: Record<string, string> = {
  allowance: "Sachbezug",
  childcare: "Kinderbetreuung",
  fitness: "Fitness",
  vl: "VL",
  discount: "Rabatt",
  corporate: "Corporate Benefits",
};

const typeIcons: Record<string, React.ReactNode> = {
  allowance: <UtensilsCrossed className="h-4 w-4" />,
  childcare: <Baby className="h-4 w-4" />,
  fitness: <Dumbbell className="h-4 w-4" />,
  vl: <PiggyBank className="h-4 w-4" />,
  discount: <Tag className="h-4 w-4" />,
  corporate: <Gift className="h-4 w-4" />,
};

const taxLabels: Record<string, string> = {
  tax_free: "Steuerfrei",
  taxable: "Steuerpflichtig",
  partial: "Teilweise steuerpflichtig",
};

const PayrollBenefitSettings = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BenefitTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "allowance",
    category: "",
    description: "",
    default_amount: "",
    max_amount: "",
    tax_treatment: "tax_free",
    legal_reference: "",
    is_active: true,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["benefit-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benefit_templates")
        .select("*")
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as BenefitTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<BenefitTemplate>) => {
      const { error } = await supabase.from("benefit_templates").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefit-templates"] });
      toast.success("Benefit-Vorlage erstellt");
      resetForm();
    },
    onError: () => toast.error("Fehler beim Erstellen"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BenefitTemplate> }) => {
      const { error } = await supabase.from("benefit_templates").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefit-templates"] });
      toast.success("Benefit-Vorlage aktualisiert");
      resetForm();
    },
    onError: () => toast.error("Fehler beim Aktualisieren"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("benefit_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefit-templates"] });
      toast.success("Benefit-Vorlage gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("benefit_templates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefit-templates"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "allowance",
      category: "",
      description: "",
      default_amount: "",
      max_amount: "",
      tax_treatment: "tax_free",
      legal_reference: "",
      is_active: true,
    });
    setEditingTemplate(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (template: BenefitTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category || "",
      description: template.description || "",
      default_amount: template.default_amount?.toString() || "",
      max_amount: template.max_amount?.toString() || "",
      tax_treatment: template.tax_treatment || "tax_free",
      legal_reference: template.legal_reference || "",
      is_active: template.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      type: formData.type,
      category: formData.category || null,
      description: formData.description || null,
      default_amount: formData.default_amount ? parseFloat(formData.default_amount) : null,
      max_amount: formData.max_amount ? parseFloat(formData.max_amount) : null,
      tax_treatment: formData.tax_treatment,
      legal_reference: formData.legal_reference || null,
      is_active: formData.is_active,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const groupedTemplates = templates?.reduce((acc, template) => {
    const type = template.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<string, BenefitTemplate[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Benefit-Vorlagen
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Vorlage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Vorlage bearbeiten" : "Neue Benefit-Vorlage"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. Essensgutscheine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Typ *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allowance">Sachbezug</SelectItem>
                        <SelectItem value="childcare">Kinderbetreuung</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="vl">VL</SelectItem>
                        <SelectItem value="discount">Rabatt</SelectItem>
                        <SelectItem value="corporate">Corporate Benefits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="z.B. meal, gym, kita"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Beschreibung des Benefits..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standardbetrag (€)</Label>
                    <Input
                      type="number"
                      value={formData.default_amount}
                      onChange={(e) => setFormData({ ...formData, default_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximalbetrag (€)</Label>
                    <Input
                      type="number"
                      value={formData.max_amount}
                      onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Steuerliche Behandlung</Label>
                  <Select
                    value={formData.tax_treatment}
                    onValueChange={(v) => setFormData({ ...formData, tax_treatment: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax_free">Steuerfrei</SelectItem>
                      <SelectItem value="taxable">Steuerpflichtig</SelectItem>
                      <SelectItem value="partial">Teilweise steuerpflichtig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rechtsgrundlage</Label>
                  <Input
                    value={formData.legal_reference}
                    onChange={(e) => setFormData({ ...formData, legal_reference: e.target.value })}
                    placeholder="z.B. § 8 Abs. 2 EStG"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Aktiv</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name}>
                    {editingTemplate ? "Speichern" : "Erstellen"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Laden...</p>
          ) : !templates?.length ? (
            <p className="text-muted-foreground">Keine Benefit-Vorlagen vorhanden.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates || {}).map(([type, items]) => (
                <div key={type}>
                  <h3 className="flex items-center gap-2 font-medium mb-3">
                    {typeIcons[type]}
                    {typeLabels[type] || type}
                    <Badge variant="secondary">{items.length}</Badge>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Betrag</TableHead>
                        <TableHead>Steuer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              {template.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {template.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {template.default_amount
                              ? `${template.default_amount.toFixed(2)} €`
                              : "-"}
                            {template.max_amount && template.max_amount !== template.default_amount && (
                              <span className="text-muted-foreground text-sm">
                                {" "}
                                (max {template.max_amount.toFixed(2)} €)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                template.tax_treatment === "tax_free"
                                  ? "default"
                                  : template.tax_treatment === "taxable"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {taxLabels[template.tax_treatment || ""] || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={template.is_active}
                              onCheckedChange={(checked) =>
                                toggleActiveMutation.mutate({ id: template.id, is_active: checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(template)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Vorlage wirklich löschen?")) {
                                    deleteMutation.mutate(template.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollBenefitSettings;
