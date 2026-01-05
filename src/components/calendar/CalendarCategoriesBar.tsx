
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { CalendarCategory } from '@/types/calendar';
import { calendarService } from '@/services/calendarService';

interface CalendarCategoriesBarProps {
  onCategoryToggle?: (categoryId: string, isSelected: boolean) => void;
  selectedCategories?: string[];
}

const CalendarCategoriesBar = ({ onCategoryToggle, selectedCategories = [] }: CalendarCategoriesBarProps) => {
  const [categories, setCategories] = useState<CalendarCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await calendarService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    onCategoryToggle?.(categoryId, !isSelected);
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <div
            key={category.id}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 min-w-[120px] text-center font-medium border-2 ${
              isSelected 
                ? 'shadow-md transform scale-105' 
                : 'hover:shadow-sm hover:transform hover:scale-102'
            }`}
            style={{ 
              backgroundColor: isSelected ? category.color : `${category.color}15`,
              borderColor: category.color,
              color: isSelected ? '#fff' : category.color
            }}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarCategoriesBar;
