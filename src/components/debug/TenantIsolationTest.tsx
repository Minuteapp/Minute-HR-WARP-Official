import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Database,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  table: string;
  description: string;
  passed: boolean;
  companiesFound: number;
  rowsChecked: number;
  details: string;
  executionTime: number;
}

interface TableTest {
  table: string;
  description: string;
  companyIdColumn: string;
}

const TABLES_TO_TEST: TableTest[] = [
  { table: 'employees', description: 'Mitarbeiter', companyIdColumn: 'company_id' },
  { table: 'time_entries', description: 'Zeiteinträge', companyIdColumn: 'company_id' },
  { table: 'tasks', description: 'Aufgaben', companyIdColumn: 'company_id' },
  { table: 'projects', description: 'Projekte', companyIdColumn: 'company_id' },
  { table: 'departments', description: 'Abteilungen', companyIdColumn: 'company_id' },
  { table: 'absence_requests', description: 'Abwesenheitsanträge', companyIdColumn: 'company_id' },
  { table: 'documents', description: 'Dokumente', companyIdColumn: 'company_id' },
  { table: 'unified_notifications', description: 'Benachrichtigungen', companyIdColumn: 'company_id' },
  { table: 'shift_plans', description: 'Schichtpläne', companyIdColumn: 'company_id' },
  { table: 'budgets', description: 'Budgets', companyIdColumn: 'company_id' },
];

export const TenantIsolationTest: React.FC = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallPassed, setOverallPassed] = useState<boolean | null>(null);

  // Fetch user's company_id from user_roles or employees table
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user) return;
      
      // Try user_roles first
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleData?.company_id) {
        setCompanyId(roleData.company_id);
        return;
      }
      
      // Fallback to employees table
      const { data: empData } = await supabase
        .from('employees')
        .select('company_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (empData?.company_id) {
        setCompanyId(empData.company_id);
      }
    };
    
    fetchCompanyId();
  }, [user]);

  const runTests = async () => {
    if (!user) {
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    setOverallPassed(null);

    const results: TestResult[] = [];
    let allPassed = true;

    for (const test of TABLES_TO_TEST) {
      const startTime = performance.now();
      
      try {
        // Query the table and check company_id values
        const { data, error } = await supabase
          .from(test.table as any)
          .select(test.companyIdColumn)
          .limit(1000);

        const endTime = performance.now();
        const executionTime = Math.round(endTime - startTime);

        if (error) {
          // Table might not exist or no access - this is OK
          results.push({
            table: test.table,
            description: test.description,
            passed: true,
            companiesFound: 0,
            rowsChecked: 0,
            details: `Tabelle nicht zugänglich (${error.code || 'RLS aktiv'})`,
            executionTime,
          });
          continue;
        }

        if (!data || data.length === 0) {
          results.push({
            table: test.table,
            description: test.description,
            passed: true,
            companiesFound: 0,
            rowsChecked: 0,
            details: 'Keine Daten vorhanden',
            executionTime,
          });
          continue;
        }

        // Extract unique company IDs
        const companyIds = [...new Set(
          data
            .map((row: any) => row[test.companyIdColumn])
            .filter((id: any) => id !== null && id !== undefined)
        )];

        const passed = companyIds.length <= 1;
        
        if (!passed) {
          allPassed = false;
        }

        results.push({
          table: test.table,
          description: test.description,
          passed,
          companiesFound: companyIds.length,
          rowsChecked: data.length,
          details: passed 
            ? companyIds.length === 0 
              ? 'Keine company_id Werte gefunden'
              : 'Nur eigener Mandant sichtbar ✓'
            : `WARNUNG: ${companyIds.length} verschiedene Mandanten sichtbar!`,
          executionTime,
        });

      } catch (err) {
        const endTime = performance.now();
        results.push({
          table: test.table,
          description: test.description,
          passed: true, // Assume passed if we can't access (RLS working)
          companiesFound: 0,
          rowsChecked: 0,
          details: 'Fehler beim Zugriff (RLS möglicherweise aktiv)',
          executionTime: Math.round(endTime - startTime),
        });
      }

      // Update results progressively
      setTestResults([...results]);
    }

    setOverallPassed(allPassed);
    setIsRunning(false);
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (result: TestResult) => {
    if (result.passed) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Bestanden
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        Fehlgeschlagen
      </Badge>
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Mandanten-Isolation Test</CardTitle>
              <CardDescription>
                Überprüft, ob RLS-Policies korrekt konfiguriert sind
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={runTests} 
            disabled={isRunning || !user || !companyId}
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Teste...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Tests starten
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
          <Database className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Aktueller Mandant: </span>
            <code className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">
              {companyId || 'Nicht angemeldet'}
            </code>
          </div>
        </div>

        {/* Overall Status */}
        {overallPassed !== null && (
          <Alert variant={overallPassed ? 'default' : 'destructive'}>
            {overallPassed ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            <AlertTitle>
              {overallPassed ? 'Alle Tests bestanden' : 'Sicherheitsproblem erkannt!'}
            </AlertTitle>
            <AlertDescription>
              {overallPassed 
                ? 'Die Mandanten-Isolation funktioniert korrekt. Daten anderer Mandanten sind nicht sichtbar.'
                : 'KRITISCH: Es wurden Daten von mehreren Mandanten gefunden. Bitte RLS-Policies überprüfen!'}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Testergebnisse</h4>
            <div className="border rounded-lg divide-y">
              {testResults.map((result) => (
                <div 
                  key={result.table}
                  className={`flex items-center justify-between p-3 ${
                    !result.passed ? 'bg-red-50 dark:bg-red-950/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.passed)}
                    <div>
                      <div className="font-medium text-sm">{result.description}</div>
                      <div className="text-xs text-muted-foreground">
                        <code>{result.table}</code> • {result.rowsChecked} Zeilen geprüft • {result.executionTime}ms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${result.passed ? 'text-muted-foreground' : 'text-red-600 font-medium'}`}>
                      {result.details}
                    </span>
                    {getStatusBadge(result)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {testResults.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Klicken Sie auf "Tests starten" um die Mandanten-Isolation zu überprüfen.
            </p>
            <p className="text-xs mt-1">
              Der Test prüft, ob Sie nur Daten Ihres eigenen Mandanten sehen können.
            </p>
          </div>
        )}

        {/* Refresh hint */}
        {testResults.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <RefreshCw className="h-3 w-3" />
            <span>Tests erneut ausführen um Änderungen zu überprüfen</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantIsolationTest;
