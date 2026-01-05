import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { OrganizationalStructureManagement } from '@/components/settings/organization/OrganizationalStructureManagement';

const OrganizationSettingsPage: React.FC = () => {
  return (
    <StandardPageLayout title="Organisationsstruktur">
      <OrganizationalStructureManagement />
    </StandardPageLayout>
  );
};

export default OrganizationSettingsPage;