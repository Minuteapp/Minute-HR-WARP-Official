
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Zap, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectWorkflowSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6" />
          Workflow-Automatisierung Einstellungen
        </h2>
        <p className="text-muted-foreground">
          Konfigurieren Sie automatisierte Workflows für Ihre Projektprozesse
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatisierungs-Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium">Trigger-basierte Automatisierung</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Automatische Aktionen basierend auf Ereignissen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Status-Änderungs-Trigger</li>
                <li>• Deadline-basierte Trigger</li>
                <li>• Budget-Überschreitungs-Trigger</li>
                <li>• Fortschritts-Milestone-Trigger</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Automatische Benachrichtigungen</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Intelligente E-Mail- und In-App-Benachrichtigungen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Stakeholder-Benachrichtigungen</li>
                <li>• Deadline-Erinnerungen</li>
                <li>• Status-Update-Mails</li>
                <li>• Eskalations-Benachrichtigungen</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Zeitbasierte Aktionen</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Geplante und wiederkehrende Automatisierungen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Wöchentliche Status-Reports</li>
                <li>• Monatliche Budget-Reviews</li>
                <li>• Quartalsweise Portfolio-Analysen</li>
                <li>• Automatische Archivierung</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Workflow className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Workflow-Vorlagen</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Vordefinierte Workflow-Templates
              </p>
              <ul className="text-sm space-y-1">
                <li>• Agile/Scrum Workflows</li>
                <li>• Waterfall-Methodik</li>
                <li>• Custom Workflow-Builder</li>
                <li>• Approval-Workflows</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Automatisierte Workflows reduzieren manuellen Aufwand und verbessern die Konsistenz
              </p>
              <Link to="/projects/workflows">
                <Button>
                  Workflows konfigurieren
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementierte Automatisierungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Aktive Workflows</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Status-Änderungs-Workflows</li>
                  <li>• Deadline-Erinnerungssystem</li>
                  <li>• Budget-Überwachung</li>
                  <li>• Team-Benachrichtigungen</li>
                </ul>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Automatische Task-Erstellung</li>
                  <li>• Progress-Tracking</li>
                  <li>• Report-Generierung</li>
                  <li>• Performance-Monitoring</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📊 Workflow-Statistiken</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">95%</div>
                  <div className="text-sm text-blue-600">Automatisierungsrate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">-60%</div>
                  <div className="text-sm text-blue-600">Manuelle Arbeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">99.8%</div>
                  <div className="text-sm text-blue-600">Zuverlässigkeit</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectWorkflowSettings;

