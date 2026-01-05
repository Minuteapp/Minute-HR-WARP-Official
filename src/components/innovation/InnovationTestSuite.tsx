import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInnovation } from '@/hooks/useInnovation';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export const InnovationTestSuite = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const innovation = useInnovation();

  const testCases = [
    {
      name: 'Hook Initialization',
      test: async () => {
        if (!innovation) throw new Error('Innovation Hook nicht verfügbar');
        return 'Hook erfolgreich initialisiert';
      }
    },
    {
      name: 'Pilotprojekte laden',
      test: async () => {
        if (innovation.isLoading) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        if (innovation.pilotProjects === undefined) {
          throw new Error('Pilotprojekte sind undefined');
        }
        return `${innovation.pilotProjects.length} Pilotprojekte geladen`;
      }
    },
    {
      name: 'Ideen laden',
      test: async () => {
        if (innovation.isLoading) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        if (innovation.ideas === undefined) {
          throw new Error('Ideen sind undefined');
        }
        return `${innovation.ideas.length} Ideen geladen`;
      }
    },
    {
      name: 'Statistiken laden',
      test: async () => {
        if (innovation.isLoading) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        if (!innovation.statistics) {
          throw new Error('Statistiken sind undefined');
        }
        return `Statistiken: ${innovation.statistics.total_ideas} Ideen total`;
      }
    },
    {
      name: 'KI Features laden',
      test: async () => {
        if (innovation.isLoading) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        if (innovation.kiFeatures === undefined) {
          throw new Error('KI Features sind undefined');
        }
        return `${innovation.kiFeatures.length} KI Features geladen`;
      }
    },
    {
      name: 'Database Connection Test',
      test: async () => {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data, error } = await supabase
            .from('pilot_projects')
            .select('id')
            .limit(1);
          
          if (error) throw error;
          return 'Datenbankverbindung erfolgreich';
        } catch (error: any) {
          throw new Error(`DB Fehler: ${error.message}`);
        }
      }
    },
    {
      name: 'RLS Policies Test',
      test: async () => {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: user } = await supabase.auth.getUser();
          
          if (!user.user) {
            throw new Error('Benutzer nicht authentifiziert');
          }

          const { data, error } = await supabase
            .from('pilot_projects')
            .select('*')
            .limit(1);
          
          if (error) throw error;
          return 'RLS Policies funktionieren korrekt';
        } catch (error: any) {
          throw new Error(`RLS Fehler: ${error.message}`);
        }
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0], index: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status: 'running' } : test
    ));

    const startTime = Date.now();
    
    try {
      const result = await testCase.test();
      const duration = Date.now() - startTime;
      
      setTests(prev => prev.map((test, i) => 
        i === index ? { 
          ...test, 
          status: 'passed', 
          message: result,
          duration 
        } : test
      ));
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      setTests(prev => prev.map((test, i) => 
        i === index ? { 
          ...test, 
          status: 'failed', 
          message: error.message,
          duration 
        } : test
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Initialize all tests
    setTests(testCases.map(tc => ({
      name: tc.name,
      status: 'pending',
      message: 'Warten auf Ausführung...'
    })));

    // Run tests sequentially
    for (let i = 0; i < testCases.length; i++) {
      await runTest(testCases[i], i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    
    const failedTests = tests.filter(t => t.status === 'failed').length;
    if (failedTests === 0) {
      toast.success('Alle Tests erfolgreich! ✅');
    } else {
      toast.error(`${failedTests} Tests fehlgeschlagen! ❌`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">BESTANDEN</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">FEHLGESCHLAGEN</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">LÄUFT</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">WARTEND</Badge>;
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    setTimeout(() => {
      runAllTests();
    }, 1000);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Innovation Hub Test Suite
          </div>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Tests ausführen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test, index) => (
          <div
            key={test.name}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(test.status)}
              <div>
                <p className="font-medium">{test.name}</p>
                <p className="text-sm text-muted-foreground">
                  {test.message}
                  {test.duration && ` (${test.duration}ms)`}
                </p>
              </div>
            </div>
            {getStatusBadge(test.status)}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Test Zusammenfassung</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">
                {tests.filter(t => t.status === 'passed').length}
              </span>
              <span className="text-muted-foreground"> bestanden</span>
            </div>
            <div>
              <span className="text-red-600 font-medium">
                {tests.filter(t => t.status === 'failed').length}
              </span>
              <span className="text-muted-foreground"> fehlgeschlagen</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">
                {tests.filter(t => t.status === 'running').length}
              </span>
              <span className="text-muted-foreground"> laufend</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">
                {tests.filter(t => t.status === 'pending').length}
              </span>
              <span className="text-muted-foreground"> wartend</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};