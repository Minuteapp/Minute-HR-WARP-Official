import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";
import { PayTypeFilters } from "./pay-types/PayTypeFilters";
import { PayTypesList } from "./pay-types/PayTypesList";
import { PayTypeForm } from "./pay-types/PayTypeForm";
import { usePayTypes, useCreatePayType, useUpdatePayType, useDeletePayType, PayType } from "@/hooks/usePayTypes";

export const PayTypesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayType, setEditingPayType] = useState<PayType | null>(null);

  const { payTypes, isLoading } = usePayTypes();
  const createMutation = useCreatePayType();
  const updateMutation = useUpdatePayType();
  const deleteMutation = useDeletePayType();

  const filteredPayTypes = useMemo(() => {
    return payTypes.filter(payType => {
      const matchesSearch = payType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payType.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || payType.component_type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [payTypes, searchTerm, selectedType]);

  const stats = useMemo(() => {
    return {
      total: payTypes.length,
      base: payTypes.filter(p => p.component_type === 'base').length,
      bonus: payTypes.filter(p => p.component_type === 'bonus').length,
      overtime: payTypes.filter(p => p.component_type === 'overtime').length,
      benefit: payTypes.filter(p => p.component_type === 'benefit').length,
      deduction: payTypes.filter(p => p.component_type === 'deduction').length,
    };
  }, [payTypes]);

  const handleEdit = (payType: PayType) => {
    setEditingPayType(payType);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingPayType(null);
    setFormOpen(true);
  };

  const handleSubmit = (data: Partial<PayType>) => {
    if (editingPayType) {
      updateMutation.mutate({ id: editingPayType.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
    setFormOpen(false);
    setEditingPayType(null);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Lade Lohnarten...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grundgehalt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.base}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bonus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bonus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Überstunden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overtime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.benefit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Abzüge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deduction}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hauptbereich */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lohnarten</CardTitle>
              <CardDescription>
                Verwalten Sie alle Entgeltarten mit steuerlicher Behandlung und DATEV-Zuordnung
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Lohnart
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PayTypeFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
          <PayTypesList
            payTypes={filteredPayTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <PayTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        payType={editingPayType}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
