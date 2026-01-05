import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IntegrationCard } from './IntegrationCard';
import { Calculator, FileSpreadsheet, MessageSquare, Users, Webhook } from 'lucide-react';

interface IntegrationsSettingsProps {
  sevdeskEnabled: boolean;
  sevdeskApiKey: string;
  sevdeskTenantId: string;
  datevEnabled: boolean;
  datevApiKey: string;
  datevTenantId: string;
  slackEnabled: boolean;
  slackApiKey: string;
  slackTenantId: string;
  msTeamsEnabled: boolean;
  webhooksEnabled: boolean;
  onSettingChange: (key: string, value: boolean | string) => void;
}

export const IntegrationsSettings = ({
  sevdeskEnabled,
  sevdeskApiKey,
  sevdeskTenantId,
  datevEnabled,
  datevApiKey,
  datevTenantId,
  slackEnabled,
  slackApiKey,
  slackTenantId,
  msTeamsEnabled,
  webhooksEnabled,
  onSettingChange
}: IntegrationsSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base">Externe Integrationen</CardTitle>
          <CardDescription>
            Verbinde Workflows mit externen Tools und Services
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IntegrationCard
          name="SevDesk"
          description="Buchhaltungs-Integration für automatische Belegverarbeitung"
          icon={Calculator}
          enabled={sevdeskEnabled}
          onToggle={(enabled) => onSettingChange('sevdesk_enabled', enabled)}
          apiKey={sevdeskApiKey}
          tenantId={sevdeskTenantId}
          onApiKeyChange={(value) => onSettingChange('sevdesk_api_key', value)}
          onTenantIdChange={(value) => onSettingChange('sevdesk_tenant_id', value)}
        />

        <IntegrationCard
          name="DATEV"
          description="Steuerberater-Schnittstelle für Lohnbuchhaltung"
          icon={FileSpreadsheet}
          enabled={datevEnabled}
          onToggle={(enabled) => onSettingChange('datev_enabled', enabled)}
          apiKey={datevApiKey}
          tenantId={datevTenantId}
          onApiKeyChange={(value) => onSettingChange('datev_api_key', value)}
          onTenantIdChange={(value) => onSettingChange('datev_tenant_id', value)}
        />

        <IntegrationCard
          name="Slack"
          description="Team-Kommunikation und Benachrichtigungen"
          icon={MessageSquare}
          enabled={slackEnabled}
          onToggle={(enabled) => onSettingChange('slack_enabled', enabled)}
          apiKey={slackApiKey}
          tenantId={slackTenantId}
          onApiKeyChange={(value) => onSettingChange('slack_api_key', value)}
          onTenantIdChange={(value) => onSettingChange('slack_tenant_id', value)}
        />

        <IntegrationCard
          name="Microsoft Teams"
          description="Unternehmens-Chat und Kollaboration"
          icon={Users}
          enabled={msTeamsEnabled}
          onToggle={(enabled) => onSettingChange('ms_teams_enabled', enabled)}
          showFields={false}
        />

        <IntegrationCard
          name="Webhooks aktivieren"
          description="Externe Trigger über HTTP-Endpoints"
          icon={Webhook}
          enabled={webhooksEnabled}
          onToggle={(enabled) => onSettingChange('webhooks_enabled', enabled)}
          showFields={false}
        />
      </div>
    </div>
  );
};
