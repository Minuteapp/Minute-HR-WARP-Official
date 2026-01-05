import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { X, Eye, Edit, Check } from 'lucide-react';
import { usePermissionMatrix, usePermissionCategories, usePermissionModules, useUpdateRolePermissionTemplateMutation } from '@/integrations/supabase/hooks/useEmployeeRoles';
import { PermissionChangeDialog } from './dialogs/PermissionChangeDialog';
import { supabase } from '@/integrations/supabase/client';

const ROLES = ['Mitarbeiter', 'Teamleiter', 'HR-Manager', 'Administrator'];

const ROLE_ICONS: Record<string, { label: string; color: string }> = {
  'Mitarbeiter': { label: 'M', color: 'bg-blue-500' },
  'Teamleiter': { label: 'T', color: 'bg-green-500' },
  'HR-Manager': { label: 'H', color: 'bg-purple-500' },
  'Administrator': { label: 'A', color: 'bg-red-500' },
};

interface EditDialogState {
  open: boolean;
  role: string;
  category: string;
  module: string;
  currentLevel: string;
  nextLevel: string;
}

const PermissionIcon = ({ 
  level, 
  onClick, 
  disabled 
}: { 
  level: string; 
  onClick?: () => void; 
  disabled?: boolean;
}) => {
  const getIcon = () => {
  switch (level) {
      case 'none':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <X className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-xs text-muted-foreground">Kein Zugriff</span>
          </div>
        );
      case 'read':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs text-muted-foreground">Nur Lesen</span>
          </div>
        );
      case 'write':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Edit className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-xs text-muted-foreground">Lesen & Schreiben</span>
          </div>
        );
      case 'full':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-xs text-muted-foreground">Voller Zugriff</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const icon = getIcon();
  
  if (disabled || !onClick) {
    return icon; // Read-only
  }
  
  return (
    <button
      onClick={onClick}
      className="hover:scale-110 transition-transform cursor-pointer"
      title="Klicken zum Ändern"
    >
      {icon}
    </button>
  );
};

export const PermissionMatrixCard = () => {
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    role: '',
    category: '',
    module: '',
    currentLevel: '',
    nextLevel: '',
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  
  const { data: permissionMatrix = [], isLoading: isLoadingMatrix } = usePermissionMatrix();
  const { data: categories = [], isLoading: isLoadingCategories } = usePermissionCategories();
  const { data: allModules = [], isLoading: isLoadingModules } = usePermissionModules();
  const updatePermissionMutation = useUpdateRolePermissionTemplateMutation();

  // Check if user is admin (can edit)
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Check if user has admin or super_admin role
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setCanEdit(userRole?.role === 'administrator' || userRole?.role === 'super_admin');
      }
    };
    
    checkAdminStatus();
  }, []);

  if (isLoadingMatrix || isLoadingCategories || isLoadingModules) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Lade Berechtigungsmatrix...</p>
        </CardContent>
      </Card>
    );
  }

  // Gruppiere Permissions nach Kategorie und Modul
  const getPermissionLevel = (role: string, category: string, module: string) => {
    const permission = permissionMatrix.find(
      (p) => p.role_name === role && p.category === category && p.module === module
    );
    return permission?.permission_level || 'none';
  };

  const handlePermissionClick = (
    role: string, 
    category: string, 
    module: string, 
    currentLevel: string
  ) => {
    if (!canEdit) return;
    
    // Cycle durch Permissions: none → read → write → full → none
    const levels = ['none', 'read', 'write', 'full'];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[(currentIndex + 1) % levels.length];
    
    setEditDialog({
      open: true,
      role,
      category,
      module,
      currentLevel,
      nextLevel,
    });
  };

  const handleConfirmChange = async (reason: string) => {
    await updatePermissionMutation.mutateAsync({
      role: editDialog.role,
      category: editDialog.category,
      module: editDialog.module,
      newLevel: editDialog.nextLevel,
      reason,
      changedBy: currentUserId || undefined,
    });
    
    setEditDialog({ ...editDialog, open: false });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📊 Detaillierte Berechtigungsmatrix</CardTitle>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Bearbeitbar
              </Badge>
            )}
            <Badge>{categories.length} Kategorien</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {categories.map((category) => {
            const categoryModules = allModules.filter(
              (m) => m.category_id === category.id
            );

            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{categoryModules.length}</Badge>
                    <span className="font-semibold">{category.category_name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold text-sm">
                            Modul / Funktion
                          </th>
                          {ROLES.map((role) => (
                            <th
                              key={role}
                              className="text-center py-3 px-2 min-w-[120px]"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-8 h-8 rounded-full ${ROLE_ICONS[role].color} flex items-center justify-center text-white font-bold text-sm`}
                                >
                                  {ROLE_ICONS[role].label}
                                </div>
                                <span className="text-xs font-medium">{role}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categoryModules.map((module) => (
                          <tr key={module.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2 text-sm font-medium">
                              {module.module_name}
                            </td>
                            {ROLES.map((role) => {
                              const level = getPermissionLevel(
                                role,
                                category.category_name,
                                module.module_name
                              );
                              
                              return (
                                <td key={role} className="py-3 px-2 text-center">
                                  <PermissionIcon
                                    level={level}
                                    onClick={canEdit ? () => handlePermissionClick(
                                      role, 
                                      category.category_name, 
                                      module.module_name,
                                      level
                                    ) : undefined}
                                    disabled={!canEdit}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        
        {canEdit && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            💡 Klicken Sie auf ein Berechtigungssymbol, um es zu ändern
          </p>
        )}
      </CardContent>

      <PermissionChangeDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
        role={editDialog.role}
        category={editDialog.category}
        module={editDialog.module}
        currentLevel={editDialog.currentLevel}
        nextLevel={editDialog.nextLevel}
        onConfirm={handleConfirmChange}
        isLoading={updatePermissionMutation.isPending}
      />
    </Card>
  );
};
