import { EnterpriseUserManagement } from '@/components/settings/users/EnterpriseUserManagement';
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Benutzerverwaltung</h1>
            <p className="text-muted-foreground mt-2">
              Ultra-granulare Verwaltung von Benutzern, Rollen und Berechtigungen
            </p>
          </div>
        </div>

        <EnterpriseUserManagement />
      </div>
    </PageLayout>
  );
}