import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PermissionRoleRowProps {
  action: string;
  description: string;
  roles: string[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  hr_manager: 'HR-Manager',
  team_lead: 'Teamleiter',
  employee: 'Mitarbeiter',
  revisor: 'Revisor',
  superadmin: 'Superadmin'
};

export const PermissionRoleRow = ({
  action,
  description,
  roles,
  selectedRoles,
  onRoleToggle
}: PermissionRoleRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm text-foreground">{action}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap justify-end ml-4">
        {roles.map((role) => {
          const isSelected = selectedRoles.includes(role);
          return (
            <Badge
              key={role}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors text-xs',
                isSelected 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              )}
              onClick={() => onRoleToggle(role)}
            >
              {roleLabels[role] || role}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
