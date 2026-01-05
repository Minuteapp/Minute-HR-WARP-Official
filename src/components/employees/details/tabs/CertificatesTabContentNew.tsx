import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCertificatesData } from '@/hooks/employee-tabs/useCertificatesData';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { CertificateDialog } from '../dialogs/CertificateDialog';
import { Award, AlertTriangle, Calendar, FileText, Plus, Edit, Trash2 } from 'lucide-react';
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

interface CertificatesTabContentNewProps {
  employeeId: string;
}

export const CertificatesTabContentNew: React.FC<CertificatesTabContentNewProps> = ({ employeeId }) => {
  const { certificates, statistics, byCategory, isLoading, uploadCertificate, updateCertificate, deleteCertificate } = useCertificatesData(employeeId);
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    await uploadCertificate.mutateAsync(data);
  };

  const handleEdit = async (data: any) => {
    if (selectedCertificate) {
      await updateCertificate.mutateAsync({ id: selectedCertificate.id, data });
    }
  };

  const handleDelete = async () => {
    if (certToDelete) {
      await deleteCertificate.mutateAsync(certToDelete);
      setDeleteDialogOpen(false);
      setCertToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setSelectedCertificate(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (cert: any) => {
    setSelectedCertificate(cert);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Zertifikate...</div>;
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const threeMonths = new Date();
    threeMonths.setMonth(now.getMonth() + 3);
    return expiry > now && expiry <= threeMonths;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Zertifikate & Qualifikationen
        </h2>
        {canCreate('employee_certificates') && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Zertifikat hinzufügen
          </Button>
        )}
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
              <p className="text-xs text-muted-foreground">Aktiv</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{statistics.expiringSoon}</p>
              <p className="text-xs text-muted-foreground">Läuft bald ab</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{statistics.expired}</p>
              <p className="text-xs text-muted-foreground">Abgelaufen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zertifikate nach Kategorie */}
      {Object.entries(byCategory).map(([category, certs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(certs as any[]).map((cert) => (
                <div key={cert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{cert.certificate_name}</h5>
                      {isExpired(cert.expiry_date) && (
                        <Badge variant="destructive" className="text-xs">
                          Abgelaufen
                        </Badge>
                      )}
                      {isExpiringSoon(cert.expiry_date) && !isExpired(cert.expiry_date) && (
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Läuft bald ab
                        </Badge>
                      )}
                    </div>
                    
                    {cert.issuing_organization && (
                      <p className="text-sm text-muted-foreground">
                        Ausgestellt von: {cert.issuing_organization}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ausgestellt: {new Date(cert.issue_date).toLocaleDateString('de-DE')}
                      </div>
                      {cert.expiry_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Gültig bis: {new Date(cert.expiry_date).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cert.file_url && (
                      <a 
                        href={cert.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <FileText className="h-5 w-5" />
                      </a>
                    )}
                    {canEdit('employee_certificates') && (
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(cert)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete('employee_certificates') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setCertToDelete(cert.id);
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

      {certificates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Zertifikate vorhanden</p>
            {canCreate('employee_certificates') && (
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Zertifikat hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <CertificateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreate : handleEdit}
        certificate={selectedCertificate}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zertifikat löschen?</AlertDialogTitle>
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
