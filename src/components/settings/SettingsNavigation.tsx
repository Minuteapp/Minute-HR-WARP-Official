
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { settingsStructure } from "@/config/settings-structure";
import { ChevronRight, ChevronDown } from "lucide-react";

interface SettingsNavigationProps {
  currentCategory: string;
  currentSubcategory: string | null;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (category: string, subcategory: string) => void;
}

export const SettingsNavigation = ({
  currentCategory,
  currentSubcategory,
  onCategoryChange,
  onSubcategoryChange
}: SettingsNavigationProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Debug-Logging
  useEffect(() => {
    console.log('SettingsNavigation: Aktuelle Navigation:', {
      currentCategory,
      currentSubcategory
    });
  }, [currentCategory, currentSubcategory]);
  
  // Auto-expand current category on mount
  useEffect(() => {
    if (currentCategory) {
      setExpandedCategories(prev => ({
        ...prev,
        [currentCategory]: true
      }));
    }
  }, [currentCategory]);
  
  const toggleCategory = (categoryId: string) => {
    console.log('SettingsNavigation: Toggle Kategorie:', categoryId);
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  return (
    <div className="bg-white border border-primary/30 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-700 break-words">Einstellungen Navigation</h3>
      </div>
      <div className="p-2 max-h-[70vh] overflow-y-auto">
        {settingsStructure.map((category) => {
          const CategoryIcon = category.icon;
          
          return (
            <div key={category.id} className="mb-1">
              <div className="flex items-center">
                <Button
                  variant={currentCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start mb-1 break-words"
                  onClick={() => {
                    onCategoryChange(category.id);
                    toggleCategory(category.id);
                  }}
                >
                  <CategoryIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{category.title}</span>
                </Button>
                {category.subcategories && category.subcategories.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1 p-1 flex-shrink-0"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories[category.id] || currentCategory === category.id ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                )}
              </div>
              
              {(expandedCategories[category.id] || currentCategory === category.id) && 
              category.subcategories && 
              category.subcategories.length > 0 && (
                <div className="ml-4 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id}>
                      <Button
                        variant={currentSubcategory === subcategory.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start pl-6 text-sm break-words"
                        onClick={() => onSubcategoryChange(category.id, subcategory.id)}
                      >
                        <ChevronRight className={`mr-1 h-3 w-3 flex-shrink-0 ${
                          currentSubcategory === subcategory.id ? "transform rotate-90" : ""
                        }`} />
                        <span className="truncate">{subcategory.title}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
