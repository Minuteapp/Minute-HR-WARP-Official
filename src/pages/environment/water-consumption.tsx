
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WaterConsumption = () => {
  const navigate = useNavigate();
  const { data: waterData, isLoading } = useQuery({
    queryKey: ['water-consumption'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_consumption')
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
            <Droplets className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Wasserverbrauch</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Gesamtverbrauch</h3>
          <p className="text-3xl font-bold text-blue-600">
            {waterData?.reduce((acc, curr) => acc + Number(curr.consumption_value), 0).toFixed(2)} m³
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Kosten</h3>
          <p className="text-3xl font-bold text-blue-600">
            {waterData?.reduce((acc, curr) => acc + Number(curr.cost || 0), 0).toFixed(2)} €
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Messstellen</h3>
          <p className="text-3xl font-bold text-blue-600">
            {new Set(waterData?.map(item => item.location)).size}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Verbrauchsverlauf</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="consumption_value" 
                stroke="#3b82f6" 
                name="Wasserverbrauch" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default WaterConsumption;
