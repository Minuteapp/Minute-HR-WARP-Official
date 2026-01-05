
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Euro } from "lucide-react";

export function SalaryBenchmark() {
  const { data: benchmarkData, isLoading } = useQuery({
    queryKey: ['salary-benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_benchmarks')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Lade Benchmark-Daten...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5 text-primary" />
          Gehaltsbenchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 mb-6">
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Position auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Positionen</SelectItem>
              <SelectItem value="hr">HR Manager</SelectItem>
              <SelectItem value="dev">Entwickler</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Region auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Regionen</SelectItem>
              <SelectItem value="north">Nord</SelectItem>
              <SelectItem value="south">Süd</SelectItem>
              <SelectItem value="east">Ost</SelectItem>
              <SelectItem value="west">West</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">Filter anwenden</Button>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={benchmarkData || []}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="median_salary" fill="#9333ea" name="Median" />
              <Bar dataKey="average_salary" fill="#a855f7" name="Durchschnitt" />
              <Bar dataKey="upper_limit" fill="#c084fc" name="Obergrenze" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
