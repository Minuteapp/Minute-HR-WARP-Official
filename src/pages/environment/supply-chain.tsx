
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Container, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SupplyChain = () => {
  const navigate = useNavigate();
  const { data: supplierData, isLoading } = useQuery({
    queryKey: ['supply-chain-sustainability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supply_chain_sustainability')
        .select('*')
        .order('assessment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="w-full p-6">Lädt...</div>;
  }

  const averageScore = supplierData?.reduce((acc, curr) => acc + Number(curr.sustainability_score || 0), 0) / (supplierData?.length || 1);

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
            <Container className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl font-bold">Nachhaltige Lieferkette</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Lieferanten</h3>
          <p className="text-3xl font-bold text-purple-600">
            {supplierData?.length || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Durchschnittliche Bewertung</h3>
          <p className="text-3xl font-bold text-purple-600">
            {averageScore.toFixed(1)} / 100
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">CO2-Fußabdruck</h3>
          <p className="text-3xl font-bold text-purple-600">
            {supplierData?.reduce((acc, curr) => acc + Number(curr.co2_footprint || 0), 0).toFixed(2)} t
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Nachhaltigkeitsbewertungen</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="supplier_name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="sustainability_score" 
                fill="#9333ea" 
                name="Nachhaltigkeitsbewertung" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-4">
        {supplierData?.map((supplier) => (
          <Card key={supplier.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{supplier.supplier_name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bewertung</p>
                    <p className="font-medium">{supplier.sustainability_score} / 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CO2-Fußabdruck</p>
                    <p className="font-medium">{supplier.co2_footprint} t</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Letzte Bewertung</p>
                    <p className="font-medium">{new Date(supplier.assessment_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                (supplier.sustainability_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                (supplier.sustainability_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(supplier.sustainability_score || 0) >= 80 ? 'Sehr gut' :
                 (supplier.sustainability_score || 0) >= 60 ? 'Gut' : 'Verbesserungsbedarf'}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupplyChain;
