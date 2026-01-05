
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const EnvironmentDashboard = () => {
  const { data: carbonData } = useQuery({
    queryKey: ["carbon-footprint"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carbon_footprint")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: energyData } = useQuery({
    queryKey: ["energy-consumption"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("energy_consumption")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: wasteData } = useQuery({
    queryKey: ["waste-management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_management")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"];

  const totalEmissions = carbonData?.reduce(
    (acc, curr) => acc + Number(curr.emissions_value),
    0
  );

  const totalEnergy = energyData?.reduce(
    (acc, curr) => acc + Number(curr.consumption_value),
    0
  );

  const wasteByType = wasteData?.reduce((acc: any, curr) => {
    if (!acc[curr.waste_type]) {
      acc[curr.waste_type] = 0;
    }
    acc[curr.waste_type] += Number(curr.amount);
    return acc;
  }, {});

  const pieData = wasteByType
    ? Object.entries(wasteByType).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Gesamtemissionen</h3>
          <p className="text-3xl font-bold text-green-600">
            {totalEmissions?.toFixed(2)} kg CO2e
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Gesamtenergieverbrauch</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {totalEnergy?.toFixed(2)} kWh
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Recyclingquote</h3>
          <p className="text-3xl font-bold text-blue-600">
            {wasteData
              ?.reduce(
                (acc, curr) =>
                  acc + (Number(curr.recycling_rate || 0) * Number(curr.amount)),
                0
              )
              .toFixed(1)}
            %
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">CO2-Emissionen</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="emissions_value"
                  stroke="#22c55e"
                  name="CO2 Emissionen"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Energieverbrauch</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="consumption_value"
                  fill="#eab308"
                  name="Energieverbrauch"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Abfallverteilung</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    name,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
