
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Check } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalarySimulations() {
  const [increasePercentage, setIncreasePercentage] = useState("5");
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const { data: currentData } = useQuery({
    queryKey: ['salary-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('salary_amount')
        .not('salary_amount', 'is', null);

      if (error) throw error;
      return data;
    }
  });

  const runSimulation = () => {
    if (!currentData) return;

    const percentage = parseFloat(increasePercentage);
    const simulatedData = currentData.map((item: any) => ({
      ...item,
      simulated_amount: item.salary_amount * (1 + percentage / 100)
    }));

    setSimulationResult({
      current_total: currentData.reduce((sum: number, item: any) => sum + item.salary_amount, 0),
      simulated_total: simulatedData.reduce((sum: number, item: any) => sum + item.simulated_amount, 0),
      difference: simulatedData.reduce((sum: number, item: any) => sum + item.simulated_amount, 0) -
                 currentData.reduce((sum: number, item: any) => sum + item.salary_amount, 0)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Gehaltssimulationen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">
              Gehaltserhöhung (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={increasePercentage}
              onChange={(e) => setIncreasePercentage(e.target.value)}
            />
          </div>
          <Button onClick={runSimulation}>
            <Check className="mr-2 h-4 w-4" />
            Simulation starten
          </Button>
        </div>

        {simulationResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(simulationResult.current_total)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Aktuelle Gesamtkosten
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(simulationResult.simulated_total)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Simulierte Gesamtkosten
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(simulationResult.difference)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Zusätzliche Kosten
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Aktuell', value: simulationResult.current_total },
                    { name: 'Simuliert', value: simulationResult.simulated_total }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
