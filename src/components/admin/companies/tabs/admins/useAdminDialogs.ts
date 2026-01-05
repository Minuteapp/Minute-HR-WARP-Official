
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAdminDialogs = (
  onResendInvitation: (email: string) => Promise<void>,
  onDeleteAdmin?: (adminId: string, adminEmail: string) => Promise<void>
) => {
  const [selectedAdminEmail, setSelectedAdminEmail] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{id: string, email: string} | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendInvitation = (email: string) => {
    setSelectedAdminEmail(email);
    setSendError(null); // Reset previous errors
    setIsAlertOpen(true);
  };

  const confirmSendInvitation = async () => {
    if (!selectedAdminEmail) return;
    
    setIsSending(true);
    setSendError(null);
    
    try {
      await onResendInvitation(selectedAdminEmail);
      setIsAlertOpen(false);
      
      toast({
        description: `An invitation has been sent to ${selectedAdminEmail}`
      });
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      
      // Display error in dialog with more detail for debugging
      setSendError(error.message || "The invitation could not be sent. Please try again later.");
      
      // Dialog remains open so user can see the error
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAdmin = (id: string, email: string) => {
    setAdminToDelete({ id, email });
    setDeleteError(null); // Reset previous errors
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete || !onDeleteAdmin) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await onDeleteAdmin(adminToDelete.id, adminToDelete.email);
      setIsDeleteAlertOpen(false);
      
      toast({
        description: `The administrator has been successfully deleted`
      });
    } catch (error: any) {
      console.error("Error deleting administrator:", error);
      
      // Display error in dialog
      setDeleteError(error.message || "The administrator could not be deleted.");
      
      // Dialog remains open so user can see the error
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedAdminEmail,
    isAlertOpen,
    setIsAlertOpen,
    isDeleteAlertOpen,
    setIsDeleteAlertOpen,
    adminToDelete,
    isSending,
    isDeleting,
    sendError,
    deleteError,
    handleSendInvitation,
    confirmSendInvitation,
    handleDeleteAdmin,
    confirmDeleteAdmin
  };
};
