
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Recycle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WasteManagement = () => {
  const navigate = useNavigate();
  const { data: wasteData, isLoading } = useQuery({
    queryKey: ['waste-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_management')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const COLORS = ['#22c55e', '#eab308', '#ef4444'];

  const pieData = wasteData?.reduce((acc, curr) => {
    const existingType = acc.find(item => item.name === curr.waste_type);
    if (existingType) {
      existingType.value += Number(curr.amount);
    } else {
      acc.push({ name: curr.waste_type, value: Number(curr.amount) });
    }
    return acc;
  }, []) || [];

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
            <Recycle className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl font-bold">Abfallmanagement</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Gesamtabfall</h3>
          <p className="text-3xl font-bold text-green-600">
            {wasteData?.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)} kg
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Recyclingquote</h3>
          <p className="text-3xl font-bold text-green-600">
            {(wasteData?.reduce((acc, curr) => acc + Number(curr.recycling_rate || 0), 0) / (wasteData?.length || 1)).toFixed(1)}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Abfallarten</h3>
          <p className="text-3xl font-bold text-green-600">
            {new Set(wasteData?.map(item => item.waste_type)).size}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Abfallverteilung</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default WasteManagement;
