import React, { useEffect, useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTenantRolePreview } from '@/hooks/useTenantRolePreview';
import { UserRole } from '@/hooks/useRolePreview';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RoleColorConfig {
  badge: string;
  icon: string;
}

const roleColors: Record<string, RoleColorConfig> = {
  employee: {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: 'text-gray-600',
  },
  team_lead: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: 'text-green-600',
  },
  hr_admin: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'text-blue-600',
  },
  admin: {
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: 'text-purple-600',
  },
};

export const GlobalRolePreviewSwitcher: React.FC = () => {
  const { user } = useAuth();
  const {
    canUseTenantRolePreview,
    availableRoles,
    currentPreviewRole,
    isInTenantMode,
    isLoading,
    switchToRole,
    exitPreview,
    getRoleLabel,
  } = useTenantRolePreview();

  const [hasActiveSession, setHasActiveSession] = useState(false);

  // NOTFALL-MECHANISMUS 1: Prüfe IMMER auf aktive Session
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_role_preview_sessions')
        .select('is_preview_active')
        .eq('user_id', user.id)
        .eq('is_preview_active', true)
        .maybeSingle();
      
      const sessionExists = !!data;
      setHasActiveSession(sessionExists);
      console.log('🚨 NOTFALL-CHECK: Aktive Session:', sessionExists);
    };
    
    checkActiveSession();
  }, [user?.id, currentPreviewRole]);

  // NOTFALL-MECHANISMUS 2: Keyboard-Shortcut (Ctrl+Shift+E)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        console.log('⌨️ NOTFALL: Keyboard-Shortcut ausgelöst!');
        exitPreview();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [exitPreview]);

  // NOTFALL-MECHANISMUS 3: Console-Command
  useEffect(() => {
    (window as any).exitRolePreview = async () => {
      console.log('💻 NOTFALL: Console-Command ausgelöst!');
      await exitPreview();
    };
    
    return () => {
      delete (window as any).exitRolePreview;
    };
  }, [exitPreview]);

  // NOTFALL-MECHANISMUS 4: URL-Parameter (?exit-preview=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('exit-preview') === 'true' && hasActiveSession) {
      console.log('🔗 NOTFALL: URL-Parameter erkannt!');
      exitPreview();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [hasActiveSession, exitPreview]);

  // DEBUG: Zeige alle Werte
  console.log('🎭 GlobalRolePreviewSwitcher:', {
    canUseTenantRolePreview,
    isLoading,
    availableRoles,
    currentPreviewRole,
    isInTenantMode,
    hasActiveSession
  });

  // NOTFALL-ANZEIGE: Wenn aktive Session existiert, zeige IMMER Exit-Button
  if (hasActiveSession && !canUseTenantRolePreview) {
    console.log('🚨 NOTFALL-MODUS: Zeige Emergency Exit Button!');
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
        <Button 
          onClick={exitPreview}
          variant="destructive"
          className="shadow-lg"
        >
          🚪 Preview beenden (SuperAdmin)
        </Button>
      </div>
    );
  }

  // Nur anzeigen wenn SuperAdmin (egal ob mit oder ohne Tenant)
  if (!canUseTenantRolePreview || isLoading) {
    console.log('❌ Switcher versteckt:', { canUseTenantRolePreview, isLoading });
    return null;
  }
  
  console.log('✅ Switcher wird angezeigt!');

  const handleRoleChange = async (value: string) => {
    if (value === 'normal') {
      await exitPreview();
    } else {
      await switchToRole(value as UserRole);
    }
  };

  const getCurrentRoleConfig = () => {
    const role = currentPreviewRole || 'normal';
    return roleColors[role] || roleColors.employee;
  };

  const config = getCurrentRoleConfig();

  const modeLabel = isInTenantMode ? 'Firmen-Vorschau' : 'Rollen-Vorschau';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${config.badge} font-medium text-xs px-2 py-1 border`}
          >
            <Eye className={`h-3 w-3 mr-1 ${config.icon}`} />
            {modeLabel}
          </Badge>
          
          <Select
            value={currentPreviewRole || 'normal'}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Rolle wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs">Rolle wechseln</SelectLabel>
                
                {/* Normal/SuperAdmin Ansicht */}
                <SelectItem value="normal" className="text-xs">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                      <span>Normal (SuperAdmin)</span>
                    </div>
                    {!currentPreviewRole && (
                      <Check className="h-3 w-3 text-primary ml-2" />
                    )}
                  </div>
                </SelectItem>

                {/* Verfügbare Rollen */}
                {availableRoles.map((role) => {
                  const roleConfig = roleColors[role] || roleColors.employee;
                  const isActive = currentPreviewRole === role;

                  return (
                    <SelectItem key={role} value={role} className="text-xs">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${roleConfig.badge.split(' ')[0]}`}
                          />
                          <span>{getRoleLabel(role)}</span>
                        </div>
                        {isActive && (
                          <Check className="h-3 w-3 text-primary ml-2" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
