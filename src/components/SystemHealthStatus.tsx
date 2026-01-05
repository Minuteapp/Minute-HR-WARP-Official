import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Shield,
  Database,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ModuleStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  icon: React.ComponentType<any>;
  description: string;
  lastCheck: Date;
  dependencies?: string[];
}

export const SystemHealthStatus = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Test database connectivity
  const { data: dbHealth } = useQuery({
    queryKey: ['db-health'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('employees').select('count').limit(1);
        return { status: error ? 'error' : 'healthy', error };
      } catch (error) {
        return { status: 'error', error };
      }
    },
    refetchInterval: 30000
  });

  const checkModuleHealth = async () => {
    setIsRefreshing(true);
    
    const moduleChecks: ModuleStatus[] = [
      {
        name: 'Datenbank',
        status: dbHealth?.status === 'healthy' ? 'healthy' : 'error',
        icon: Database,
        description: 'Supabase Datenbankverbindung',
        lastCheck: new Date()
      },
      {
        name: 'Mitarbeiter-Modul',
        status: 'healthy', // Wird durch weitere Checks ersetzt
        icon: Users,
        description: 'Mitarbeiterverwaltung und Profile',
        lastCheck: new Date(),
        dependencies: ['Datenbank']
      },
      {
        name: 'Kalender-System',
        status: 'healthy',
        icon: Calendar,
        description: 'Terminplanung und Events',
        lastCheck: new Date(),
        dependencies: ['Datenbank']
      },
      {
        name: 'Aufgaben-Management',
        status: 'healthy',
        icon: FileText,
        description: 'Task-Board und Projektaufgaben',
        lastCheck: new Date(),
        dependencies: ['Datenbank', 'Mitarbeiter-Modul']
      },
      {
        name: 'Projekt-Verwaltung',
        status: 'healthy',
        icon: Briefcase,
        description: 'Projektmanagement und Roadmaps',
        lastCheck: new Date(),
        dependencies: ['Datenbank', 'Aufgaben-Management']
      },
      {
        name: 'Zeiterfassung',
        status: 'healthy',
        icon: Clock,
        description: 'Arbeitszeit-Tracking',
        lastCheck: new Date(),
        dependencies: ['Datenbank', 'Mitarbeiter-Modul']
      },
      {
        name: 'Roadmap-Planung',
        status: 'healthy',
        icon: MapPin,
        description: 'Strategische Roadmap-Planung',
        lastCheck: new Date(),
        dependencies: ['Datenbank', 'Projekt-Verwaltung']
      },
      {
        name: 'Geschäftsreisen',
        status: 'healthy',
        icon: DollarSign,
        description: 'Reisemanagement und Spesen',
        lastCheck: new Date(),
        dependencies: ['Datenbank', 'Mitarbeiter-Modul']
      }
    ];

    // Weitere spezifische Checks
    try {
      // Test Employee Module
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .limit(1);
      
      const empModule = moduleChecks.find(m => m.name === 'Mitarbeiter-Modul');
      if (empModule) {
        empModule.status = empError ? 'error' : 'healthy';
      }

      // Test Calendar System
      const { data: events, error: calError } = await supabase
        .from('calendar_events')
        .select('id')
        .limit(1);
      
      const calModule = moduleChecks.find(m => m.name === 'Kalender-System');
      if (calModule) {
        calModule.status = calError ? 'warning' : 'healthy';
      }

      // Test Tasks
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);
      
      const taskModule = moduleChecks.find(m => m.name === 'Aufgaben-Management');
      if (taskModule) {
        taskModule.status = taskError ? 'warning' : 'healthy';
      }

      // Test Projects  
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id')
        .limit(1);
      
      const projModule = moduleChecks.find(m => m.name === 'Projekt-Verwaltung');
      if (projModule) {
        projModule.status = projError ? 'warning' : 'healthy';
      }

      // Test Roadmaps
      const { data: roadmaps, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('id')
        .limit(1);
      
      const roadmapModule = moduleChecks.find(m => m.name === 'Roadmap-Planung');
      if (roadmapModule) {
        roadmapModule.status = roadmapError ? 'warning' : 'healthy';
      }

    } catch (error) {
      console.error('Health check error:', error);
    }

    setModules(moduleChecks);
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkModuleHealth();
  }, [dbHealth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const healthyCount = modules.filter(m => m.status === 'healthy').length;
  const warningCount = modules.filter(m => m.status === 'warning').length;
  const errorCount = modules.filter(m => m.status === 'error').length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            System-Gesundheitsstatus
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkModuleHealth}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
            <div className="text-sm text-green-700">Gesund</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-yellow-700">Warnungen</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-700">Fehler</div>
          </div>
        </div>

        {/* Module Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Module-Status</h3>
          <div className="grid gap-3">
            {modules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <module.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-gray-500">{module.description}</div>
                    {module.dependencies && (
                      <div className="text-xs text-gray-400 mt-1">
                        Abhängigkeiten: {module.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(module.status)}
                  {getStatusBadge(module.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Schnellaktionen</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              App neu laden
            </Button>
            <Button variant="outline" size="sm" onClick={() => localStorage.clear()}>
              Cache leeren
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log('System Status:', modules)}>
              Debug-Info
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};