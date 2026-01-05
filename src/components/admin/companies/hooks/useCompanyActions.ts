
import { useCompanyDeactivation } from "./useCompanyDeactivation";
import { useCompanyDeletion } from "./useCompanyDeletion";
import { useCallback } from "react";

export const useCompanyActions = (onSuccess: () => void) => {
  // Create a reliable success callback that can be safely called multiple times
  const safeSuccessCallback = useCallback(() => {
    console.log("Company action success callback triggered");
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      onSuccess();
    });
  }, [onSuccess]);
  
  // Use same success callback for deactivation
  const { handleDeactivateCompany } = useCompanyDeactivation(safeSuccessCallback);
  
  // Use a proper callback for deletion
  const { handleDeleteCompany } = useCompanyDeletion(safeSuccessCallback);

  return {
    handleDeactivateCompany,
    handleDeleteCompany
  };
};
