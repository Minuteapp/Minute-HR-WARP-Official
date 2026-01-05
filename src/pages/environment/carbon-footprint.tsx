
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CarbonFootprint = () => {
  const navigate = useNavigate();
  const { data: carbonData, isLoading } = useQuery({
    queryKey: ['carbon-footprint'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carbon_footprint')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="w-full p-6">Lädt...</div>;
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/environment')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl font-bold">CO2-Bilanz</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Gesamtemissionen</h3>
          <p className="text-3xl font-bold text-green-600">
            {carbonData?.reduce((acc, curr) => acc + Number(curr.emissions_value), 0).toFixed(2)} kg CO2e
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Größte Quelle</h3>
          <p className="text-lg">
            {carbonData?.[0]?.source || "Keine Daten"}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Letzte Messung</h3>
          <p className="text-lg">
            {carbonData?.[0]?.date ? new Date(carbonData[0].date).toLocaleDateString() : "Keine Daten"}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Emissionsverlauf</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={carbonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="emissions_value" fill="#22c55e" name="CO2 Emissionen" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default CarbonFootprint;
