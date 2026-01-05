
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Receipt, 
  DollarSign, 
  CreditCard,
  Calculator,
  FileText,
  TrendingUp
} from 'lucide-react';

interface PayrollExpensesProps {
  projectId: string;
  projectName: string;
}

export const PayrollExpenses: React.FC<PayrollExpensesProps> = ({
  projectId,
  projectName
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Mock-Daten für Spesen-Lohnabrechnung
  const expenseData = {
    totalExpenses: 2450.75,
    reimbursableExpenses: 1980.50,
    taxableExpenses: 470.25,
    processedExpenses: 1750.25,
    pendingExpenses: 700.50
  };

  const employees: { id: string; name: string; totalExpenses: number; reimbursable: number; taxable: number; categories: { travel: number; meals: number; equipment: number }; status: string }[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800">Verarbeitet</Badge>;
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
      {/* Spesen-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt-Spesen</p>
                <p className="text-2xl font-bold">€{expenseData.totalExpenses.toFixed(2)}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erstattungsfähig</p>
                <p className="text-2xl font-bold">€{expenseData.reimbursableExpenses.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {((expenseData.reimbursableExpenses / expenseData.totalExpenses) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Steuerpflichtig</p>
                <p className="text-2xl font-bold">€{expenseData.taxableExpenses.toFixed(2)}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {((expenseData.taxableExpenses / expenseData.totalExpenses) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausstehend</p>
                <p className="text-2xl font-bold">€{expenseData.pendingExpenses.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spesen-Kategorien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Spesen-Kategorien für Lohnabrechnung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reisekosten</h4>
              <p className="text-2xl font-bold text-blue-600">€970.00</p>
              <p className="text-sm text-gray-500">Vollständig erstattbar</p>
              <div className="mt-2 text-xs text-gray-600">
                Steuerlich absetzbar nach Reisekostenverordnung
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Verpflegung</h4>
              <p className="text-2xl font-bold text-green-600">€710.75</p>
              <p className="text-sm text-gray-500">Pauschalen-basiert</p>
              <div className="mt-2 text-xs text-gray-600">
                Nach Verpflegungspauschalen berechnet
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Arbeitsmittel</h4>
              <p className="text-2xl font-bold text-orange-600">€770.00</p>
              <p className="text-sm text-gray-500">Teilweise steuerpflichtig</p>
              <div className="mt-2 text-xs text-gray-600">
                Über Freigrenze hinausgehende Beträge
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mitarbeiter Spesen-Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Spesen-Abrechnung nach Mitarbeiter</CardTitle>
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              In Lohnabrechnung übernehmen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium">{employee.name}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Reisen:</span> 
                      <span className="ml-1 font-medium">€{employee.categories.travel.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Verpflegung:</span> 
                      <span className="ml-1 font-medium">€{employee.categories.meals.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Equipment:</span> 
                      <span className="ml-1 font-medium">€{employee.categories.equipment.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-1 text-xs text-gray-600">
                    <div>Erstattbar: €{employee.reimbursable.toFixed(2)}</div>
                    <div>Steuerpflichtig: €{employee.taxable.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">€{employee.totalExpenses.toFixed(2)}</p>
                  {getStatusBadge(employee.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Steuerliche Behandlung */}
      <Card>
        <CardHeader>
          <CardTitle>Steuerliche Behandlung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Steuerfreie Erstattungen</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Fahrtkosten (0,30€/km)</span>
                  <span className="font-medium">€420.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Übernachtungspauschalen</span>
                  <span className="font-medium">€350.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Verpflegungspauschalen</span>
                  <span className="font-medium">€280.50</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Gesamt steuerfrei</span>
                    <span>€1,050.50</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Steuerpflichtige Beträge</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Überschreitung Pauschalen</span>
                  <span className="font-medium">€280.25</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Private Nutzung Equipment</span>
                  <span className="font-medium">€140.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bewirtung über Grenzen</span>
                  <span className="font-medium">€50.00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Gesamt steuerpflichtig</span>
                    <span>€470.25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spesen-Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle>Spesen-Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Durchschnittliche Spesen pro Mitarbeiter</span>
              <span className="font-medium">€816.92</span>
            </div>
            <Progress value={68} className="w-full" />
            
            <div className="flex justify-between items-center">
              <span>Erstattungsquote</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-600">80.8%</span>
              </div>
            </div>
            <Progress value={80.8} className="w-full" />
            
            <div className="flex justify-between items-center">
              <span>Verarbeitungsfortschritt</span>
              <span className="font-medium">71.4%</span>
            </div>
            <Progress value={71.4} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
