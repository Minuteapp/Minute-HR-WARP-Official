import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface OrganizationFilterProps {
  filterOptions: any;
  setFilterOptions: any;
  locations: any[];
  departments: any[];
  teams: any[];
  totalEmployees: number;
  filteredCount: number;
  onExport: () => void;
  onAnalytics: () => void;
}

export function OrganizationFilter({
  filterOptions,
  setFilterOptions,
  locations,
  departments,
  teams,
  totalEmployees,
  filteredCount,
  onExport,
  onAnalytics
}: OrganizationFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisation Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={onExport}>Export</Button>
          <Button onClick={onAnalytics}>Analytics</Button>
          <Badge>{filteredCount} von {totalEmployees}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}