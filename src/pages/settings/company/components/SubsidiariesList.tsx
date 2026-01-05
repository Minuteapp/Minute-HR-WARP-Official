import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, AlertCircle } from "lucide-react";
import { NewSubsidiaryDialog } from './NewSubsidiaryDialog';
import { EditSubsidiaryDialog } from './EditSubsidiaryDialog';
import { DeleteSubsidiaryDialog } from './DeleteSubsidiaryDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Subsidiary {
  id: string;
  name: string;
  legal_form: string;
  address: string;
  contact_person: string;
  status: 'active' | 'inactive';
}

export const SubsidiariesList = () => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null);

  const { data: subsidiaries = [], isLoading } = useQuery({
    queryKey: ['subsidiaries', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('subsidiaries')
        .select('*')
        .eq('parent_company_id', companyId)
        .order('name');
      if (error) {
        console.log('subsidiaries query error:', error.message);
        return [];
      }
      return (data || []).map(s => ({
        id: s.id,
        name: s.name || '',
        legal_form: s.legal_form || '',
        address: s.address || '',
        contact_person: s.contact_person || '',
        status: s.status || 'active'
      })) as Subsidiary[];
    },
    enabled: !!companyId
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subsidiaries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidiaries', companyId] });
      toast({ title: "Gelöscht", description: "Tochtergesellschaft wurde entfernt." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Fehler", description: "Konnte nicht gelöscht werden." });
    }
  });
  
  const handleEdit = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary);
    setShowEditDialog(true);
  };
  
  const handleDelete = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Tochtergesellschaften</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Tochtergesellschaften</CardTitle>
          <Button size="sm" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          {subsidiaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Tochtergesellschaften vorhanden</p>
              <p className="text-sm text-muted-foreground mt-1">Fügen Sie eine neue Tochtergesellschaft hinzu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Rechtsform</th>
                    <th className="text-left py-3 px-4 font-medium">Ansprechpartner</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {subsidiaries.map((subsidiary) => (
                    <tr key={subsidiary.id} className="border-b">
                      <td className="py-3 px-4">{subsidiary.name}</td>
                      <td className="py-3 px-4">{subsidiary.legal_form}</td>
                      <td className="py-3 px-4">{subsidiary.contact_person}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          subsidiary.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subsidiary.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(subsidiary)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subsidiary)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialoge */}
      <NewSubsidiaryDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSave={(newSubsidiary) => {
          queryClient.invalidateQueries({ queryKey: ['subsidiaries', companyId] });
          setShowNewDialog(false);
        }}
      />
      
      {selectedSubsidiary && (
        <>
          <EditSubsidiaryDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            subsidiary={selectedSubsidiary}
            onSave={(updatedSubsidiary) => {
              queryClient.invalidateQueries({ queryKey: ['subsidiaries', companyId] });
              setShowEditDialog(false);
            }}
          />
          
          <DeleteSubsidiaryDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            subsidiary={selectedSubsidiary}
            onDelete={() => {
              deleteMutation.mutate(selectedSubsidiary.id);
              setShowDeleteDialog(false);
            }}
          />
        </>
      )}
    </>
  );
};
