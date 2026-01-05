
import React from 'react';
import { CompanyAdmin } from '../types';
import { useAdminDialogs } from './admins/useAdminDialogs';
import { CompanyAdminsHeader } from './admins/CompanyAdminsHeader';
import { AdminList } from './admins/AdminList';
import SendInvitationDialog from './admins/SendInvitationDialog';
import { DeleteAdminDialog } from './admins/DeleteAdminDialog';

interface CompanyAdminsTabProps {
  companyId: string;
  companyAdmins: CompanyAdmin[];
  onAddAdmin: () => void;
  onResendInvitation: (email: string) => Promise<void>;
  onEditAdmin?: (admin: CompanyAdmin) => void;
  onDeleteAdmin?: (adminId: string, adminEmail: string) => Promise<void>;
}

export const CompanyAdminsTab: React.FC<CompanyAdminsTabProps> = ({
  companyId,
  companyAdmins,
  onAddAdmin,
  onResendInvitation,
  onEditAdmin,
  onDeleteAdmin
}) => {
  const {
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
  } = useAdminDialogs(onResendInvitation, onDeleteAdmin);

  return (
    <div className="space-y-4">
      <CompanyAdminsHeader onAddAdmin={onAddAdmin} />

      <AdminList
        companyAdmins={companyAdmins}
        onAddAdmin={onAddAdmin}
        onResendInvitation={onResendInvitation}
        onEditAdmin={onEditAdmin}
        onDeleteAdmin={onDeleteAdmin}
        handleSendInvitation={handleSendInvitation}
        handleDeleteAdmin={handleDeleteAdmin}
      />

      <SendInvitationDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmSendInvitation}
        adminEmail={selectedAdminEmail}
        isSending={isSending}
        sendError={sendError}
      />

      <DeleteAdminDialog
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDeleteAdmin}
        adminEmail={adminToDelete?.email || null}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
};
