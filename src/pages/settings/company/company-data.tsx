import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyInformationTabs } from './components/CompanyInformationTabs';

export default function CompanyDataPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings/company")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Unternehmenseinstellungen
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Unternehmensstammdaten</h1>
              <p className="text-muted-foreground mt-2">
                Firmennamen, Rechtsform, Identifikationsdaten und Kontaktinformationen
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <CompanyInformationTabs />
      </div>
    </PageLayout>
  );
}