
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, MessageSquare, AlertTriangle, Eye } from "lucide-react";
import { useWhistleblowerReports } from '@/hooks/useCompliance';

export const WhistleblowerSystem = () => {
  const { data: reports, isLoading } = useWhistleblowerReports();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'investigating': return 'bg-orange-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade Whistleblower-Berichte...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anonym melden Sektion */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-blue-900">Whistleblower-System</CardTitle>
              <CardDescription className="text-blue-700">
                Sicheres und anonymes Meldesystem für Verstöße und Missstände
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900">Vertrauliche Meldung</h3>
              <p className="text-sm text-blue-700">
                Melden Sie Verstöße, Missstände oder unethisches Verhalten sicher und anonym. 
                Ihre Identität wird geschützt und Ihre Meldung vertraulich behandelt.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>100% Anonymität gewährleistet</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Verschlüsselte Datenübertragung</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Schutz vor Vergeltungsmaßnahmen</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900">Was können Sie melden?</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Korruption</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Belästigung</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Sicherheitsmängel</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Diskriminierung</span>
                </div>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Anonyme Meldung erstellen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eingegangene Meldungen */}
      <Card>
        <CardHeader>
          <CardTitle>Eingegangene Meldungen</CardTitle>
          <CardDescription>
            Übersicht aller Whistleblower-Meldungen und deren Bearbeitungsstatus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports?.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <Badge className={`text-white ${getStatusColor(report.status)}`}>
                          {report.status === 'submitted' && 'Eingegangen'}
                          {report.status === 'under_review' && 'In Prüfung'}
                          {report.status === 'investigating' && 'Wird untersucht'}
                          {report.status === 'resolved' && 'Gelöst'}
                          {report.status === 'closed' && 'Geschlossen'}
                        </Badge>
                        <Badge variant="outline">
                          {report.category === 'corruption' && 'Korruption'}
                          {report.category === 'harassment' && 'Belästigung'}
                          {report.category === 'safety' && 'Sicherheit'}
                          {report.category === 'discrimination' && 'Diskriminierung'}
                          {report.category === 'other' && 'Sonstiges'}
                        </Badge>
                        {report.severity_assessment && (
                          <Badge className={`text-white ${getSeverityColor(report.severity_assessment)}`}>
                            {report.severity_assessment === 'critical' && 'Kritisch'}
                            {report.severity_assessment === 'high' && 'Hoch'}
                            {report.severity_assessment === 'medium' && 'Mittel'}
                            {report.severity_assessment === 'low' && 'Niedrig'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Token: {report.report_token.substring(0, 8)}...</span>
                        <Badge variant="outline" className="text-xs">
                          {report.anonymity_level === 'anonymous' && 'Vollständig anonym'}
                          {report.anonymity_level === 'confidential' && 'Vertraulich'}
                          {report.anonymity_level === 'identified' && 'Identifiziert'}
                        </Badge>
                        <span>Eingegangen: {new Date(report.created_at).toLocaleDateString('de-DE')}</span>
                        {report.department_affected && (
                          <span>Betroffene Abteilung: {report.department_affected}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reports?.length === 0 && (
              <div className="text-center py-10">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine Meldungen eingegangen</p>
                <p className="text-sm text-gray-400">
                  Das Whistleblower-System ist bereit für vertrauliche Meldungen
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
