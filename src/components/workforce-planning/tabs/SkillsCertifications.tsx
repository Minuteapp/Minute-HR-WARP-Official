import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, BookOpen, Calendar, CheckCircle2 } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";

export const SkillsCertifications = () => {
  const { skillsMatrix, dashboardKPIs, isLoading } = useWorkforceExtended();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-green-100 text-green-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const skillStats = skillsMatrix?.reduce((acc, skill) => {
    acc.total++;
    if (skill.status === 'active') acc.active++;
    if (skill.status === 'expired') acc.expired++;
    if (skill.expiry_date) {
      const expiryDate = new Date(skill.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      if (expiryDate <= thirtyDaysFromNow && skill.status === 'active') {
        acc.expiringSoon++;
      }
    }
    return acc;
  }, { total: 0, active: 0, expired: 0, expiringSoon: 0 }) || { total: 0, active: 0, expired: 0, expiringSoon: 0 };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Skills/Zerts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Erfasste Qualifikationen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Zertifikate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillStats.active}</div>
            <p className="text-xs text-muted-foreground">
              Gültige Zertifizierungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laufen bald ab</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardKPIs.expiringCerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Innerhalb 30 Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgelaufene Zerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillStats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Erneuerung erforderlich
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Certifications Alert */}
      {dashboardKPIs.expiringCerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Zertifikate laufen bald ab
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardKPIs.expiringCerts.slice(0, 5).map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">{cert.certification_name || cert.skill_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Mitarbeiter ID: {cert.user_id.slice(0, 8)}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-sm font-medium text-orange-700">
                      Läuft ab: {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('de-DE') : 'Unbekannt'}
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Training anfordern
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Skills & Zertifikate Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillsMatrix?.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{skill.skill_name}</div>
                  {skill.certification_name && (
                    <div className="text-sm text-muted-foreground">
                      Zertifikat: {skill.certification_name} ({skill.certification_level})
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Mitarbeiter: {skill.user_id.slice(0, 8)}
                  </div>
                  {skill.acquired_date && (
                    <div className="text-sm text-muted-foreground">
                      Erworben: {new Date(skill.acquired_date).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <Badge variant="secondary" className={getSkillLevelColor(skill.skill_level)}>
                    Level {skill.skill_level}
                  </Badge>
                  <Badge variant="secondary" className={getStatusColor(skill.status)}>
                    {skill.status}
                  </Badge>
                  {skill.expiry_date && (
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Gültig bis: {new Date(skill.expiry_date).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!skillsMatrix || skillsMatrix.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Skills oder Zertifikate erfasst</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};