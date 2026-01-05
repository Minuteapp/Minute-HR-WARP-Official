import { Card, CardContent } from "@/components/ui/card";
import { Archive, Filter, Calendar } from "lucide-react";

interface ArchiveKPICardsProps {
  totalArchived: number;
  filteredCount: number;
  yearsInArchive: number;
}

export const ArchiveKPICards = ({ 
  totalArchived, 
  filteredCount, 
  yearsInArchive 
}: ArchiveKPICardsProps) => {
  const cards = [
    {
      title: "Archivierte Ziele",
      value: totalArchived,
      icon: Archive,
      iconColor: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Gefilterte Ziele",
      value: filteredCount,
      icon: Filter,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Jahre im Archiv",
      value: yearsInArchive,
      icon: Calendar,
      iconColor: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
