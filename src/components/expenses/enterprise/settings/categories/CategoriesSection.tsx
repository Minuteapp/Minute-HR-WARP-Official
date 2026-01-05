
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CategoryItem from './CategoryItem';
import CostCenterItem from './CostCenterItem';

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface CostCenter {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);

  const handleCategoryToggle = (id: string, isActive: boolean) => {
    setCategories(prev => 
      prev.map(cat => cat.id === id ? { ...cat, isActive } : cat)
    );
  };

  const handleCategoryEdit = (id: string) => {
    console.log('Edit category:', id);
  };

  const handleCategoryDelete = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleCostCenterToggle = (id: string, isActive: boolean) => {
    setCostCenters(prev => 
      prev.map(cc => cc.id === id ? { ...cc, isActive } : cc)
    );
  };

  const handleCostCenterEdit = (id: string) => {
    console.log('Edit cost center:', id);
  };

  const handleCostCenterDelete = (id: string) => {
    setCostCenters(prev => prev.filter(cc => cc.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Ausgabenkategorien */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Ausgabenkategorien</CardTitle>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neue Kategorie
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Kategorien vorhanden. Erstellen Sie eine neue Kategorie.
            </div>
          ) : (
            <div>
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  {...category}
                  onToggle={handleCategoryToggle}
                  onEdit={handleCategoryEdit}
                  onDelete={handleCategoryDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kostenstellen */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Kostenstellen</CardTitle>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Neue Kostenstelle
          </Button>
        </CardHeader>
        <CardContent>
          {costCenters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Kostenstellen vorhanden. Erstellen Sie eine neue Kostenstelle.
            </div>
          ) : (
            <div>
              {costCenters.map((costCenter) => (
                <CostCenterItem
                  key={costCenter.id}
                  {...costCenter}
                  onToggle={handleCostCenterToggle}
                  onEdit={handleCostCenterEdit}
                  onDelete={handleCostCenterDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesSection;
