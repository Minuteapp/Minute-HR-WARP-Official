import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { EnterpriseAbsenceManagement } from '@/components/absence/enterprise/EnterpriseAbsenceManagement';
import { EnterpriseDocumentManagement } from '@/components/documents/enterprise/EnterpriseDocumentManagement';
import { 
  Users, FileText, Calendar, TrendingUp, Shield, 
  Settings, Database, Workflow, BarChart3 
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const EnterprisePage: React.FC = () => {
  const { hasAccess, permissions, isLoading } = useEnterprisePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  // Enterprise Statistics
  const enterpriseStats = [
    {
      title: 'Aktive Module',
      value: permissions.length.toString(),
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Berechtigungen',
      value: permissions.reduce((acc, p) => acc + p.allowed_actions.length, 0).toString(),
      icon: Shield,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Workflows',
      value: '12',
      icon: Workflow,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Performance',
      value: '99.8%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Enterprise Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Management</h1>
            <p className="text-muted-foreground">
              Erweiterte Verwaltung für große Organisationen mit granularen Berechtigungen
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Konfiguration
            </Button>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Übersicht</span>
            </TabsTrigger>
            
            {hasAccess('absence_requests') && (
              <TabsTrigger value="absence" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Abwesenheit</span>
              </TabsTrigger>
            )}
            
            {hasAccess('documents') && (
              <TabsTrigger value="documents" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Dokumente</span>
              </TabsTrigger>
            )}
            
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Benutzer</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enterprise Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enterpriseStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Permission Matrix Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Berechtigungsmatrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.module_name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{permission.module_name}</h4>
                        <Badge variant={permission.is_visible ? 'default' : 'secondary'}>
                          {permission.is_visible ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Aktionen: {permission.allowed_actions.length}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {permission.allowed_actions.slice(0, 3).map((action) => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                          {permission.allowed_actions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{permission.allowed_actions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    </div>
                    <h4 className="font-medium">Datenbank</h4>
                    <p className="text-sm text-muted-foreground">Operational</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    </div>
                    <h4 className="font-medium">API</h4>
                    <p className="text-sm text-muted-foreground">Operational</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    </div>
                    <h4 className="font-medium">Workflows</h4>
                    <p className="text-sm text-muted-foreground">Operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Absence Management Tab */}
          {hasAccess('absence_requests') && (
            <TabsContent value="absence">
              <EnterpriseAbsenceManagement />
            </TabsContent>
          )}

          {/* Document Management Tab */}
          {hasAccess('documents') && (
            <TabsContent value="documents">
              <EnterpriseDocumentManagement />
            </TabsContent>
          )}

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Benutzerverwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Benutzerverwaltung</h3>
                  <p className="text-muted-foreground mb-4">
                    Erweiterte Benutzerverwaltung wird in Kürze verfügbar sein
                  </p>
                  <Button variant="outline">
                    Zur Standard-Verwaltung
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default EnterprisePage;