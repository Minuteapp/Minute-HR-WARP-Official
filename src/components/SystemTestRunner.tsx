// ============= System-Test-Runner Komponente =============

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { testRunner, TestResult } from '@/utils/testUtils';
import { CheckCircle, XCircle, AlertCircle, Play, RotateCcw } from 'lucide-react';

export const SystemTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setCompleted(false);

    try {
      console.log('🚀 STARTE UMFASSENDE SYSTEM-TESTS...');
      
      // Simuliere Progress-Updates
      const totalTests = 8; // Anzahl der Tests
      let currentTest = 0;

      const updateProgress = () => {
        currentTest++;
        setProgress((currentTest / totalTests) * 100);
      };

      // Führe alle Tests aus
      await testRunner.runAllTests();
      
      // Nach jedem Test Progress aktualisieren
      updateProgress();
      
      const testResults = testRunner.getResults();
      setResults(testResults);
      setCompleted(true);
      
    } catch (error) {
      console.error('Fehler beim Ausführen der Tests:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const resetTests = () => {
    setResults([]);
    setProgress(0);
    setCompleted(false);
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'warning') => {
    const variants = {
      pass: 'bg-green-100 text-green-800 border-green-200',
      fail: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
      <Badge className={variants[status]}>
        {status === 'pass' ? 'Erfolgreich' : status === 'fail' ? 'Fehlgeschlagen' : 'Warnung'}
      </Badge>
    );
  };

  const passedTests = results.filter(r => r.status === 'pass').length;
  const failedTests = results.filter(r => r.status === 'fail').length;
  const warningTests = results.filter(r => r.status === 'warning').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 System-Test-Runner
          <Badge variant="outline">
            Alle Module
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Umfassende Tests für Time Tracking, Business Travel und Tasks Module
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Tests laufen...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Alle Tests starten
              </>
            )}
          </Button>
          
          {completed && (
            <Button onClick={resetTests} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {(isRunning || completed) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{results.length}</div>
                <div className="text-sm text-muted-foreground">Gesamt</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Erfolgreich</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Fehlgeschlagen</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
                <div className="text-sm text-muted-foreground">Warnungen</div>
              </div>
            </Card>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test-Ergebnisse</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.module}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm">{result.test}</span>
                          <span className="text-xs text-muted-foreground">({result.duration}ms)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                        {result.data && (
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isRunning && !completed && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm">
              <strong>Anweisungen:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Klicken Sie auf "Alle Tests starten" um umfassende Tests zu beginnen</li>
                <li>Tests prüfen Datenbankverbindungen, CRUD-Operationen und Funktionalität</li>
                <li>Ergebnisse werden sowohl hier als auch in der Konsole angezeigt</li>
                <li>Bei Fehlern werden Details und mögliche Lösungen angezeigt</li>
              </ul>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};