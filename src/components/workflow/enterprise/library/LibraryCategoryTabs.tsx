import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CategoryCount {
  all: number;
  onboarding: number;
  offboarding: number;
  absence: number;
  payroll: number;
  compliance: number;
}

interface LibraryCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  counts: CategoryCount;
}

export const LibraryCategoryTabs = ({
  activeCategory,
  onCategoryChange,
  counts
}: LibraryCategoryTabsProps) => {
  const categories = [
    { value: 'all', label: 'Alle Templates', count: counts.all },
    { value: 'onboarding', label: 'Onboarding', count: counts.onboarding },
    { value: 'offboarding', label: 'Offboarding', count: counts.offboarding },
    { value: 'absence', label: 'Abwesenheiten', count: counts.absence },
    { value: 'payroll', label: 'Payroll', count: counts.payroll },
    { value: 'compliance', label: 'Compliance', count: counts.compliance },
  ];

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange}>
      <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
        {categories.map((category) => (
          <TabsTrigger
            key={category.value}
            value={category.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"
          >
            {category.label}
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 min-w-5 rounded-full text-xs"
            >
              {category.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
