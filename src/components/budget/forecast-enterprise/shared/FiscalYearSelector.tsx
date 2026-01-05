import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface FiscalYearSelectorProps {
  value: string;
  onChange: (value: string) => void;
  years?: string[];
}

export const FiscalYearSelector: React.FC<FiscalYearSelectorProps> = ({
  value,
  onChange,
  years = ['2023', '2024', '2025', '2026'],
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Geschäftsjahr</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[100px]">
            {value}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {years.map((year) => (
            <DropdownMenuItem key={year} onClick={() => onChange(year)}>
              {year}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
