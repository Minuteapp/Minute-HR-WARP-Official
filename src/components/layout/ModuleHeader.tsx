import { ReactNode } from 'react';

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Standard-Header für alle Module
 * Zeigt Titel und optional den TenantRoleSwitcher für SuperAdmins
 */
export const ModuleHeader = ({ title, subtitle, actions }: ModuleHeaderProps) => {
  return (
    <div className="flex flex-col gap-0 border-b border-border bg-background">
    </div>
  );
};
