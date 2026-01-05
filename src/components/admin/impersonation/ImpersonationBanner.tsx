import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCog, 
  Clock, 
  X, 
  Eye, 
  Edit, 
  Building2,
  Maximize2,
  Plus
} from 'lucide-react';
import { useImpersonationContext } from '@/contexts/ImpersonationContext';
import { DebugShadowPanel } from './DebugShadowPanel';
import { cn } from '@/lib/utils';

interface ImpersonationBannerProps {
  className?: string;
}

export function ImpersonationBanner({ className }: ImpersonationBannerProps) {
  const { isImpersonating, session, remainingMinutes, endImpersonation, extendSession, loading } = useImpersonationContext();
  const [showShadowPanel, setShowShadowPanel] = useState(false);

  if (!isImpersonating || !session) return null;

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}:00`;
  };

  const isLowTime = remainingMinutes <= 5;
  const isViewOnly = session.mode === 'view_only';

  return (
    <>
      <div 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-between shadow-md',
          isViewOnly ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            <span className="font-medium">
              {session.is_pre_tenant ? 'Pre-Tenant Modus' : `Du agierst als: ${session.target_user_name || session.target_user_email}`}
            </span>
          </div>
          
          {session.target_tenant_name && (
            <div className="flex items-center gap-1 text-white/80">
              <Building2 className="h-4 w-4" />
              <span>{session.target_tenant_name}</span>
            </div>
          )}
          
          <Badge 
            variant="outline" 
            className={cn(
              'border-white/50 text-white',
              isViewOnly ? 'bg-blue-700' : 'bg-orange-700'
            )}
          >
            {isViewOnly ? (
              <><Eye className="h-3 w-3 mr-1" /> View-only</>
            ) : (
              <><Edit className="h-3 w-3 mr-1" /> Act-as</>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded',
            isLowTime ? 'bg-red-500 animate-pulse' : 'bg-white/20'
          )}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-medium">{formatTime(remainingMinutes)}</span>
          </div>

          {/* Verlängern Button */}
          {remainingMinutes <= 10 && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => extendSession(15)}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-1" />
              +15 min
            </Button>
          )}

          {/* Shadow Mode Button */}
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/20"
            onClick={() => setShowShadowPanel(!showShadowPanel)}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Shadow Mode
          </Button>

          {/* Beenden Button */}
          <Button 
            size="sm" 
            variant="secondary"
            onClick={endImpersonation}
            disabled={loading}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            <X className="h-4 w-4 mr-1" />
            Tunnel beenden
          </Button>
        </div>
      </div>

      {/* Spacer um Content nach unten zu verschieben */}
      <div className="h-12" />

      {/* Shadow Panel */}
      <DebugShadowPanel 
        open={showShadowPanel} 
        onOpenChange={setShowShadowPanel} 
      />
    </>
  );
}
