import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SubcategoryLineItems } from './SubcategoryLineItems';

interface Transaction {
  id: string;
  entry_date: string;
  description: string;
  employee_name: string | null;
  cost_center: string | null;
  reference_number: string | null;
  amount: number;
  approved_by: string | null;
}

interface SubcategorySectionProps {
  name: string;
  items: Transaction[];
  totalAmount: number;
  percent: number;
}

export const SubcategorySection: React.FC<SubcategorySectionProps> = ({
  name,
  items,
  totalAmount,
  percent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">{name}</span>
            <span className="text-sm text-muted-foreground">({items.length})</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
            <span className="text-sm text-muted-foreground">{percent}% der Kategorie</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 ml-6">
          <SubcategoryLineItems items={items} />
          <div className="flex justify-end p-2 border-t bg-muted/30 rounded-b-lg">
            <span className="text-sm font-medium">
              Zwischensumme {name}: {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
