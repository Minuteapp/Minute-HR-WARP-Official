
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendInvitationEmailService } from '../services/admin/adminEmailService';

interface UseAdminEmailInvitationProps {
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}

export const useAdminEmailInvitation = ({ companyId, companyName, onSuccess }: UseAdminEmailInvitationProps) => {
  const [isSending, setIsSending] = useState(false);
  
  // Send invitation mutation using the proper service
  const { mutateAsync: sendInvitationMutation } = useMutation({
    mutationFn: async (email: string) => {
      console.log(`=== useAdminEmailInvitation - Starting invitation for ${email} ===`);
      
      setIsSending(true);
      try {
        const result = await sendInvitationEmailService(email, companyId, companyName);
        console.log("useAdminEmailInvitation - Service returned:", result);
        return result;
      } catch (error: any) {
        console.error("useAdminEmailInvitation - Service error:", error);
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    onSuccess: () => {
      console.log("useAdminEmailInvitation - Mutation successful, calling onSuccess");
      onSuccess?.();
    }
  });
  
  const sendInvitation = async (email: string) => {
    try {
      console.log(`useAdminEmailInvitation - sendInvitation called for: ${email}`);
      return await sendInvitationMutation(email);
    } catch (error: any) {
      console.error("useAdminEmailInvitation - Failed to send invitation:", error);
      throw error;
    }
  };
  
  return {
    sendInvitation,
    isSending
  };
};
