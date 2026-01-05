
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DollarSign, TrendingUp, Download, Plus, Calendar, ChevronDown, ChevronUp, FileText, Eye, EyeOff } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { formatDateGerman } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface SalaryHistory {
  id: string;
  employee_id: string;
  salary_amount: number;
  salary_currency: string;
  effective_date: string;
  reason: string;
  created_at: string;
}

interface SalaryTabProps {
  employeeId: string;
  salaryHistory: SalaryHistory[] | undefined;
  employee: Employee | null;
}

export const SalaryTab = ({ employeeId, salaryHistory = [], employee }: SalaryTabProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showSalaryData, setShowSalaryData] = useState(false);
  const { toast } = useToast();
  const { isAdmin, canManageUsers } = useRolePermissions();
  
  const latestSalary = salaryHistory?.[0];
  
  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };
  
  const handleExportPayslips = () => {
    toast({
      title: "Export gestartet",
      description: "Ihre Gehaltsabrechnungen werden zum Download vorbereitet."
    });
    // Simulierter Download - in einer echten App würde hier ein API-Call erfolgen
    setTimeout(() => {
      toast({
        title: "Export abgeschlossen",
        description: "Download wurde gestartet."
      });
    }, 1500);
  };
  
  const toggleSalaryVisibility = () => {
    setShowSalaryData(!showSalaryData);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Lohn & Gehalt
          </h2>
          <p className="text-muted-foreground">
            Gehaltsinformationen, Lohnabrechnung und Boni
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={toggleSalaryVisibility}
            className="flex items-center gap-2"
          >
            {showSalaryData ? (
              <>
                <EyeOff className="h-4 w-4" />
                Daten ausblenden
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Daten einblenden
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportPayslips}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Abrechnungen exportieren
          </Button>
          
          {(isAdmin || canManageUsers) && (
            <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Gehalt anpassen
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
          <TabsTrigger value="payslips">Abrechnungen</TabsTrigger>
          <TabsTrigger value="benefits">Zusatzleistungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Aktuelle Gehaltsdetails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row justify-between mb-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Aktuelles Bruttogehalt</p>
                    {showSalaryData ? (
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-semibold">
                          {latestSalary ? 
                            formatCurrency(latestSalary.salary_amount, latestSalary.salary_currency) :
                            formatCurrency(employee?.salary_amount || 0, employee?.salary_currency)}
                        </p>
                        <p className="text-gray-500 mb-1">pro Monat</p>
                      </div>
                    ) : (
                      <div className="bg-gray-200 h-10 w-36 rounded animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mt-4 lg:mt-0">
                    <p className="text-sm text-gray-500">Gültig seit</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <p className="text-xl">
                        {latestSalary ? 
                          formatDateGerman(latestSalary.effective_date) : 
                          (employee?.start_date ? formatDateGerman(employee.start_date) : '-')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 lg:mt-0">
                    <p className="text-sm text-gray-500">Änderungsgrund</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl">
                        {latestSalary?.reason || 'Einstellung'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-medium">Gehaltszusammensetzung</h3>
                  
                  {showSalaryData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 font-medium text-primary">
                        <span>Bruttogehalt (monatlich)</span>
                        <span>
                          {latestSalary ? 
                            formatCurrency(latestSalary.salary_amount, latestSalary.salary_currency) :
                            formatCurrency(employee?.salary_amount || 0, employee?.salary_currency)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Detaillierte Gehaltsbestandteile werden im Payroll-Modul gepflegt.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>DSGVO-geschützte Daten</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Gehaltsentwicklung
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showSalaryData ? (
                  <>
                    <div className="h-40 mb-4">
                      {/* Hier würde in einer echten App ein Chart sein */}
                      <div className="h-full flex items-end">
                        <div className="w-1/6 h-20 bg-primary/20 mx-1 rounded-t"></div>
                        <div className="w-1/6 h-24 bg-primary/30 mx-1 rounded-t"></div>
                        <div className="w-1/6 h-28 bg-primary/40 mx-1 rounded-t"></div>
                        <div className="w-1/6 h-32 bg-primary/50 mx-1 rounded-t"></div>
                        <div className="w-1/6 h-36 bg-primary/60 mx-1 rounded-t"></div>
                        <div className="w-1/6 h-40 bg-primary/70 mx-1 rounded-t"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Durchschnittliches Jahreswachstum</span>
                        <Badge className="bg-green-100 text-green-800">-</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Letzte Erhöhung</span>
                        <span className="font-medium">
                          {latestSalary ? 
                            formatDateGerman(latestSalary.effective_date) : 
                            '-'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Nächste Gehaltsrunde</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-200 h-40 w-full rounded animate-pulse"></div>
                    <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                    <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                    <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">Steuer- und Sozialversicherungsdaten</CardTitle>
              </CardHeader>
              <CardContent>
                {showSalaryData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Steuerliche Daten</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Steuer-ID</span>
                          <span>{employee?.tax_id || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Steuerklasse</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kinderfreibeträge</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Konfession</span>
                          <span>-</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Sozialversicherung</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">SV-Nummer</span>
                          <span>{employee?.social_security_number || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Krankenversicherung</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Zusatzbeitrag</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rentenversicherung</span>
                          <span>-</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Bankdaten</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IBAN</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">BIC</span>
                          <span>-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auszahlungstag</span>
                          <span>-</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium mb-2">Steuerliche Daten</h3>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium mb-2">Sozialversicherung</h3>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium mb-2">Bankdaten</h3>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-6 w-full rounded animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <Badge variant="outline" className="flex items-center gap-1 text-red-700">
                    <Eye className="h-3 w-3" />
                    <span>DSGVO-geschützte sensible Daten</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Gehaltsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              {showSalaryData ? (
                salaryHistory && salaryHistory.length > 0 ? (
                  <div className="space-y-6">
                    {salaryHistory.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-medium">
                              {formatCurrency(entry.salary_amount, entry.salary_currency)}
                            </h3>
                          </div>
                          
                          <div className="flex gap-4 items-center mt-2 md:mt-0">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{formatDateGerman(entry.effective_date)}</span>
                            </div>
                            
                            <Badge>
                              {entry.reason || 'Gehaltsanpassung'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="ml-10 text-sm text-gray-500">
                          {entry.reason ? entry.reason : 'Reguläre Gehaltsanpassung'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Keine Gehaltshistorie verfügbar
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="bg-gray-200 h-8 w-full rounded animate-pulse mb-2"></div>
                      <div className="bg-gray-200 h-6 w-2/3 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payslips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gehaltsabrechnungen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Gehaltsabrechnungen verfügbar</p>
                <p className="text-sm mt-2">Abrechnungen werden im Payroll-Modul verwaltet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Zusatzleistungen & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Benefits konfiguriert</p>
                <p className="text-sm mt-2">Zusatzleistungen werden im Benefits-Tab des Mitarbeiterprofils verwaltet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gehaltsanpassung</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Funktionalität ist im Modul "Lohn & Gehalt" verfügbar.
              <br /><br />
              Möchten Sie zum Gehaltsmodul wechseln, um eine Anpassung vorzunehmen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              toast({
                title: "Navigation",
                description: "Weiterleitung zum Modul 'Lohn & Gehalt'"
              });
              setShowDialog(false);
            }}>
              Zum Gehaltsmodul
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
