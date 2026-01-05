
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'employee' | 'admin' | 'superadmin' | 'moderator';

export interface AuthUser extends User {
  role?: UserRole;
  company_id?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: string, companyId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setSession: (session: Session | null) => void;
}
