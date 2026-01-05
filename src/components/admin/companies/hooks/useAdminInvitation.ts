
import { useState, useEffect } from "react";
import { useAdminCreation } from "./useAdminCreation";
import { useAdminEmailInvitation } from "./useAdminEmailInvitation";
import { useAdminManagement } from "./useAdminManagement";

interface UseAdminInvitationProps {
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}

export const useAdminInvitation = (props: UseAdminInvitationProps) => {
  const [isSending, setIsSending] = useState(false);
  
  const { createAdminInvitation, isCreating } = useAdminCreation(props);
  const { sendInvitation, isSending: isInvitationSending } = useAdminEmailInvitation(props);
  const { updateAdmin, deleteAdmin, isProcessing } = useAdminManagement(props);

  // Set the global loading state based on all possible loading states
  useEffect(() => {
    setIsSending(isCreating || isInvitationSending || isProcessing);
  }, [isCreating, isInvitationSending, isProcessing]);

  return { 
    createAdminInvitation, 
    sendInvitation, 
    updateAdmin, 
    deleteAdmin, 
    isSending 
  };
};
