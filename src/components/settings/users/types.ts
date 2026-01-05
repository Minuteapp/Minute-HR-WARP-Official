export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string;
  role: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at?: string;
  last_sign_in_at?: string;
  status?: 'active' | 'inactive' | 'pending';
  active?: boolean;
  lastLogin?: string | null;
  created?: string;
  metadata?: Record<string, any>;
}

export interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermission[];
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  submodules?: Submodule[];
}

export interface Submodule {
  id: string;
  name: string;
  description?: string;
}

export interface RolePermission {
  moduleId: string;
  submoduleId?: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove?: boolean;
  canExport?: boolean;
}