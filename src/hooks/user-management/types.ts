
import { User } from '@/components/settings/users/types';

export interface AddUserParams {
  email: string;
  password: string;
  role: string;
}

export interface EditUserParams {
  userId: string;
  newRole: string;
}

export interface UserManagementState {
  searchQuery: string;
  openAddDialog: boolean;
  openEditDialog: boolean;
  selectedUser: User | null;
}

// Interface für interne User-Objekte mit required fields
export interface InternalUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  last_sign_in_at?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
}
