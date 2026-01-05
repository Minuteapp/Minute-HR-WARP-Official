import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  apiKey?: string;
  tenantId?: string;
  onApiKeyChange?: (value: string) => void;
  onTenantIdChange?: (value: string) => void;
  showFields?: boolean;
}

export const IntegrationCard = ({
  name,
  description,
  icon: Icon,
  enabled,
  onToggle,
  apiKey,
  tenantId,
  onApiKeyChange,
  onTenantIdChange,
  showFields = true
}: IntegrationCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{name}</p>
                {enabled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    Aktiv
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>

        {enabled && showFields && (onApiKeyChange || onTenantIdChange) && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {onApiKeyChange && (
              <div className="space-y-1.5">
                <Label htmlFor={`${name}-api-key`} className="text-xs">API Key / Token</Label>
                <Input
                  id={`${name}-api-key`}
                  type="password"
                  placeholder="••••••••••••••••"
                  value={apiKey || ''}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  className="h-9"
                />
              </div>
            )}
            {onTenantIdChange && (
              <div className="space-y-1.5">
                <Label htmlFor={`${name}-tenant-id`} className="text-xs">Tenant ID</Label>
                <Input
                  id={`${name}-tenant-id`}
                  placeholder="Tenant-ID eingeben"
                  value={tenantId || ''}
                  onChange={(e) => onTenantIdChange(e.target.value)}
                  className="h-9"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
