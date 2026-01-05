
export interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  active: boolean;
  lastLogin: string | null;
  created: string;
  metadata?: Record<string, any>;
}
