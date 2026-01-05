import React from 'react';
import { GlobalSettings } from '@/components/settings/global/GlobalSettings';
import PageLayout from '@/components/layout/PageLayout';

export default function GlobalSettingsPage() {
  return (
    <PageLayout>
      <GlobalSettings />
    </PageLayout>
  );
}