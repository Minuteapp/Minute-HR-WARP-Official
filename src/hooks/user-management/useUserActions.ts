
import { User } from '@/components/settings/users/types';
import { useUserMutations } from './useUserMutations';
import { useToast } from '@/components/ui/use-toast';

export const useUserActions = (
  isSuperAdmin: boolean,
  setOpenAddDialog: (open: boolean) => void,
  setOpenEditDialog: (open: boolean) => void,
  setSelectedUser: (user: User | null) => void,
  refetch: () => void
) => {
  const { toast } = useToast();
  const { 
    addUserMutation,
    editUserMutation,
    deleteUserMutation
  } = useUserMutations(isSuperAdmin);

  const handleAddUser = async (email: string, password: string, role: string) => {
    try {
      await addUserMutation.mutateAsync({ email, password, role });
      setOpenAddDialog(false);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Erstellen des Benutzers",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten"
      });
    }
  };

  const handleEditUser = async (userId: string, newRole: string) => {
    try {
      await editUserMutation.mutateAsync({ userId, newRole });
      setOpenEditDialog(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Aktualisieren der Benutzerrolle",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        refetch();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Fehler beim Löschen des Benutzers",
          description: error.message || "Ein unbekannter Fehler ist aufgetreten"
        });
      }
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  return {
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleEditClick
  };
};
