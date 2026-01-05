import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Lightbulb, Grid3X3, ArrowRight } from "lucide-react";

interface QuickAccessItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const quickAccessItems: QuickAccessItem[] = [
  { title: "Team ansehen", icon: Users, href: "#my-team" },
  { title: "Bedarf planen", icon: Target, href: "#personnel-demand" },
  { title: "Maßnahmen", icon: Lightbulb, href: "#measures" },
  { title: "Alle Module", icon: Grid3X3, href: "#" }
];

export const QuickAccessCards = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Schnellzugriff</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccessItems.map((item, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
          >
            <CardContent className="p-4">
              <a href={item.href} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <item.icon className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
