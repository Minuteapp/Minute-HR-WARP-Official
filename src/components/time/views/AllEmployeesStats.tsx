import { Card } from "@/components/ui/card";

const AllEmployeesStats = () => {
  const stats = [
    {
      label: "Gesamt",
      value: "--",
      subtext: "-- neu, -- Urlaub",
      subtextColor: "text-blue-600",
      borderColor: "border-l-4 border-l-blue-500",
      bgColor: "bg-blue-50/50"
    },
    {
      label: "Heute",
      value: "--",
      subtext: "Ø -- h/MA",
      subtextColor: "text-emerald-600",
      borderColor: "border-l-4 border-l-emerald-500",
      bgColor: "bg-emerald-50/50"
    },
    {
      label: "Woche",
      value: "--",
      subtext: "Ø -- h/MA",
      subtextColor: "text-blue-600",
      borderColor: "border-l-4 border-l-blue-400",
      bgColor: "bg-blue-50/30"
    },
    {
      label: "Aktiv",
      value: "--",
      subtext: "jetzt online",
      subtextColor: "text-red-500",
      borderColor: "border-l-4 border-l-gray-300",
      bgColor: "bg-gray-50/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`p-5 ${stat.borderColor} ${stat.bgColor}`}>
          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
          <p className={`text-sm mt-1 ${stat.subtextColor}`}>{stat.subtext}</p>
        </Card>
      ))}
    </div>
  );
};

export default AllEmployeesStats;
