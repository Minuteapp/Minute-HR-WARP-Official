
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plane,
  Home,
  Shield,
  TrendingUp,
  Globe
} from "lucide-react";
import type { GlobalMobilityRequest } from '@/types/global-mobility';
import { formatCurrency } from '@/utils/currencyUtils';

interface GlobalMobilityRequestDetailProps {
  request: GlobalMobilityRequest;
}

export const GlobalMobilityRequestDetail: React.FC<GlobalMobilityRequestDetailProps> = ({
  request
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'draft': return 10;
      case 'submitted': return 25;
      case 'under_review': return 50;
      case 'approved': return 75;
      case 'in_progress': return 85;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getRiskLevel = () => {
    // Mock risk calculation based on destination and other factors
    const riskFactors = {
      'USA': 'medium',
      'China': 'high',
      'UK': 'low',
      'Germany': 'low',
      'India': 'medium'
    };
    
    const destination = request.destination_location?.toLowerCase() || '';
    for (const [country, risk] of Object.entries(riskFactors)) {
      if (destination.includes(country.toLowerCase())) {
        return risk;
      }
    }
    return 'low';
  };

  const riskLevel = getRiskLevel();
  const riskColor = riskLevel === 'high' ? 'text-red-600' : riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{request.current_location} → {request.destination_location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {request.start_date && new Date(request.start_date).toLocaleDateString()} - 
                  {request.end_date && new Date(request.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(request.status)} variant="secondary">
              {request.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="mt-2">
              <div className="text-sm text-gray-600 mb-1">Fortschritt</div>
              <Progress value={getProgressPercentage(request.status)} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Geschätzte Kosten</div>
                <div className="font-semibold">
                  {request.estimated_cost ? formatCurrency(request.estimated_cost) : 'Nicht angegeben'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${riskColor}`} />
              <div>
                <div className="text-sm text-gray-600">Risiko-Level</div>
                <div className={`font-semibold capitalize ${riskColor}`}>
                  {riskLevel}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Dauer</div>
                <div className="font-semibold">
                  {request.start_date && request.end_date
                    ? `${Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24))} Tage`
                    : 'Nicht definiert'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Typ</div>
                <div className="font-semibold capitalize">
                  {request.request_type.replace('_', ' ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="visa">Visa & Permits</TabsTrigger>
          <TabsTrigger value="relocation">Relocation</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="costs">Kosten</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Antragsdetails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Beschreibung</div>
                  <div className="text-gray-900 mt-1">
                    {request.description || 'Keine Beschreibung verfügbar'}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-gray-700">Geschäftliche Begründung</div>
                  <div className="text-gray-900 mt-1">
                    {request.business_justification || 'Keine Begründung verfügbar'}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Priorität</div>
                    <Badge variant="outline" className="mt-1">
                      {request.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Erstellt am</div>
                    <div className="text-gray-900 mt-1">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  KI-Risiko-Analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visa-Compliance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Steuer-Risiko</span>
                    <div className="flex items-center gap-2">
                      <Progress value={70} className="w-20" />
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Politische Stabilität</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-20" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800">Empfehlung</div>
                      <div className="text-yellow-700 mt-1">
                        Visa-Antrag sollte mindestens 90 Tage vor geplantem Start eingereicht werden.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visa">
          <Card>
            <CardHeader>
              <CardTitle>Visa & Work Permits</CardTitle>
              <CardDescription>
                Verwaltung von Visa-Anträgen und Arbeitsgenehmigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Plane className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Visa-Management wird implementiert</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relocation">
          <Card>
            <CardHeader>
              <CardTitle>Relocation Services</CardTitle>
              <CardDescription>
                Umzugs- und Ansiedlungsdienstleistungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Relocation-Services werden implementiert</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Tracking</CardTitle>
              <CardDescription>
                Überwachung rechtlicher und steuerlicher Compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Compliance-Tracking wird implementiert</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Kostenübersicht</CardTitle>
              <CardDescription>
                Detaillierte Aufschlüsselung aller Mobility-Kosten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Kostenmanagement wird implementiert</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>
                Alle relevanten Dokumente für diesen Mobility-Fall
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Dokumentenmanagement wird implementiert</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
