import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAwardsData } from '@/hooks/employee-tabs/useAwardsData';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { AwardDialog } from '../dialogs/AwardDialog';
import { Trophy, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AwardsTabContentNewProps {
  employeeId: string;
}

export const AwardsTabContentNew: React.FC<AwardsTabContentNewProps> = ({ employeeId }) => {
  const { awards, byYear, statistics, isLoading, addAward, updateAward, deleteAward } = useAwardsData(employeeId);
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [awardToDelete, setAwardToDelete] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    await addAward.mutateAsync(data);
  };

  const handleEdit = async (data: any) => {
    if (selectedAward) {
      await updateAward.mutateAsync({ id: selectedAward.id, data });
    }
  };

  const handleDelete = async () => {
    if (awardToDelete) {
      await deleteAward.mutateAsync(awardToDelete);
      setDeleteDialogOpen(false);
      setAwardToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setSelectedAward(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (award: any) => {
    setSelectedAward(award);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Auszeichnungen...</div>;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Leistung': 'bg-blue-100 text-blue-800',
      'Innovation': 'bg-purple-100 text-purple-800',
      'Teamarbeit': 'bg-green-100 text-green-800',
      'Kundenservice': 'bg-orange-100 text-orange-800',
      'Führung': 'bg-indigo-100 text-indigo-800',
      'Jubiläum': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Auszeichnungen & Anerkennungen
        </h2>
        {canCreate('employee_awards') && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Auszeichnung vergeben
          </Button>
        )}
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.total}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{statistics.thisYear}</p>
              <p className="text-xs text-muted-foreground">Dieses Jahr</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{Object.keys(statistics.byCategory).length}</p>
              <p className="text-xs text-muted-foreground">Kategorien</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auszeichnungen nach Jahr */}
      {Object.entries(byYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, yearAwards]) => (
          <Card key={year}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {year}
                <Badge variant="secondary" className="ml-2">
                  {(yearAwards as any[]).length} Auszeichnung{(yearAwards as any[]).length !== 1 ? 'en' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(yearAwards as any[]).map((award) => (
                  <div key={award.id} className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-transparent">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{award.award_name}</h5>
                        <Badge className={getCategoryColor(award.award_category)}>
                          {award.award_category}
                        </Badge>
                      </div>
                      {award.description && (
                        <p className="text-sm text-muted-foreground mb-2">{award.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Datum: {new Date(award.awarded_date).toLocaleDateString('de-DE')}</span>
                        {award.awarded_by && <span>Von: {award.awarded_by}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {canEdit('employee_awards') && (
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(award)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('employee_awards') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setAwardToDelete(award.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

      {awards.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Auszeichnungen erhalten</p>
            {canCreate('employee_awards') && (
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Auszeichnung vergeben
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AwardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreate : handleEdit}
        award={selectedAward}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auszeichnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
