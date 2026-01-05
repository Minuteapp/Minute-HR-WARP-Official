
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  DollarSign,
  TrendingUp,
  User,
  Calculator
} from 'lucide-react';

interface PayrollTimeTrackingProps {
  projectId: string;
  projectName: string;
}

export const PayrollTimeTracking: React.FC<PayrollTimeTrackingProps> = ({
  projectId,
  projectName
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Mock-Daten für Arbeitszeit-Gehaltsberechnung
  const timeData = {
    regularHours: 160,
    overtimeHours: 15,
    holidayHours: 8,
    totalHours: 183,
    hourlyRate: 25.50,
    regularPay: 4080,
    overtimePay: 573.75,
    holidayPay: 306,
    totalPay: 4959.75
  };

  const employees: { id: string; name: string; regularHours: number; overtimeHours: number; holidayHours: number; totalPay: number; status: string }[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'calculated':
        return <Badge className="bg-green-100 text-green-800">Berechnet</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Genehmigt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Übersicht Arbeitszeit-Gehaltsberechnung */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regelstunden</p>
                <p className="text-2xl font-bold">{timeData.regularHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">€{timeData.regularPay.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Überstunden</p>
                <p className="text-2xl font-bold">{timeData.overtimeHours}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">€{timeData.overtimePay.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Feiertage</p>
                <p className="text-2xl font-bold">{timeData.holidayHours}h</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">€{timeData.holidayPay.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamtvergütung</p>
                <p className="text-2xl font-bold">€{timeData.totalPay.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">{timeData.totalHours}h gesamt</p>
          </CardContent>
        </Card>
      </div>

      {/* Stundensatz-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Stundensatz-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Regelarbeitszeit</h4>
              <p className="text-2xl font-bold text-blue-600">€{timeData.hourlyRate.toFixed(2)}</p>
              <p className="text-sm text-gray-500">pro Stunde</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Überstunden (150%)</h4>
              <p className="text-2xl font-bold text-orange-600">€{(timeData.hourlyRate * 1.5).toFixed(2)}</p>
              <p className="text-sm text-gray-500">pro Stunde</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Feiertage (200%)</h4>
              <p className="text-2xl font-bold text-green-600">€{(timeData.hourlyRate * 2).toFixed(2)}</p>
              <p className="text-sm text-gray-500">pro Stunde</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mitarbeiter-Gehaltsberechnung */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gehaltsberechnung nach Arbeitszeit
            </CardTitle>
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              Alle berechnen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium">{employee.name}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Regelstunden:</span> {employee.regularHours}h
                    </div>
                    <div>
                      <span className="text-gray-500">Überstunden:</span> {employee.overtimeHours}h
                    </div>
                    <div>
                      <span className="text-gray-500">Feiertage:</span> {employee.holidayHours}h
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">€{employee.totalPay.toFixed(2)}</p>
                  {getStatusBadge(employee.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zeiterfassungs-Auswertung */}
      <Card>
        <CardHeader>
          <CardTitle>Arbeitszeit-Auswertung für Gehaltsabrechnung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Durchschnittliche Arbeitszeit pro Tag</span>
              <span className="font-medium">8.2 Stunden</span>
            </div>
            <Progress value={82} className="w-full" />
            
            <div className="flex justify-between items-center">
              <span>Überstunden-Quote</span>
              <span className="font-medium text-orange-600">9.2%</span>
            </div>
            <Progress value={9.2} className="w-full" />
            
            <div className="flex justify-between items-center">
              <span>Feiertags-Zuschläge</span>
              <span className="font-medium text-green-600">4.4%</span>
            </div>
            <Progress value={4.4} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
