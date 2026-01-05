
import { useState } from 'react';
import { User } from '@/components/settings/users/types';

export const useUserManagementState = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return {
    searchQuery,
    setSearchQuery,
    openAddDialog,
    setOpenAddDialog,
    openEditDialog,
    setOpenEditDialog,
    selectedUser,
    setSelectedUser
  };
};
