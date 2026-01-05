
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsStructure } from "@/config/settings-structure";
import { Link } from "react-router-dom";

export default function MobileSettingsLayout() {
  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-xl font-bold mb-4">Einstellungen</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {settingsStructure.map((card) => {
            const IconComponent = card.icon;
            
            return (
              <Link 
                key={card.id} 
                to={`/settings/${card.id}`}
                className="no-underline block"
              >
                <Card className="bg-white border border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm">
                  <CardHeader className="p-4">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-lg mr-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-gray-900 truncate">{card.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {card.subcategories && card.subcategories.length > 0 && (
                    <CardContent className="px-4 pb-4 pt-0">
                      <div className="text-xs text-gray-400">
                        {card.subcategories.length} Unterkategorien
                      </div>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
