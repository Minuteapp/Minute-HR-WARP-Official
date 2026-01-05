
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsStructure } from "@/config/settings-structure";
import { Link } from "react-router-dom";

export default function SettingsLayout() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsStructure.map((card) => {
            // Icon-Komponente direkt verwenden
            const IconComponent = card.icon;
            
            return (
              <Link 
                key={card.id} 
                to={`/settings/${card.id}`}
                className="no-underline block h-full"
              >
                <Card className="bg-white border border-primary/30 hover:shadow-xl transition-all duration-300 h-full cursor-pointer shadow-sm">
                  <CardHeader className="p-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <CardTitle className="text-lg text-gray-900 break-words">{card.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-6 pt-0">
                    {card.subcategories && card.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {card.subcategories.slice(0, 3).map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 break-words"
                          >
                            {subcategory.title}
                          </div>
                        ))}
                        {card.subcategories.length > 3 && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                            +{card.subcategories.length - 3} weitere
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
