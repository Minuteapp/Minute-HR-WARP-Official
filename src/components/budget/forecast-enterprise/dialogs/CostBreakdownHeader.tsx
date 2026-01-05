import React from 'react';

interface CostBreakdownHeaderProps {
  category: string;
  positionCount: number;
  subcategoryCount: number;
  totalAmount: number;
}

export const CostBreakdownHeader: React.FC<CostBreakdownHeaderProps> = ({
  category,
  positionCount,
  subcategoryCount,
  totalAmount,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const stats = [
    { label: 'Kategorie', value: category },
    { label: 'Anzahl Positionen', value: positionCount.toString() },
    { label: 'Unterkategorien', value: subcategoryCount.toString() },
    { label: 'Gesamtsumme', value: formatCurrency(totalAmount), highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
      {stats.map((stat, index) => (
        <div key={index}>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className={`font-semibold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};
