import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, Search, Calendar, Users, AlertCircle } from 'lucide-react';
import { useAbsenceData } from './AbsenceDataProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Ausstehend', color: 'bg-orange-100 text-orange-800' },
  { value: 'approved', label: 'Genehmigt', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Abgelehnt', color: 'bg-red-100 text-red-800' }
];

const TYPE_OPTIONS = [
  { value: 'vacation', label: 'Urlaub' },
  { value: 'sick', label: 'Krankenstand' },
  { value: 'training', label: 'Fortbildung' },
  { value: 'other', label: 'Sonstiges' }
];

export const AbsenceFilters: React.FC = () => {
  const { filters, updateFilters, resetFilters } = useAbsenceData();
  const [isExpanded, setIsExpanded] = useState(false);

  // Load departments dynamically
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null);
      
      const uniqueDepts = [...new Set(data?.map(e => e.department))];
      return uniqueDepts.filter(Boolean);
    }
  });

  // Load employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      return data || [];
    }
  });

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked 
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    updateFilters({ status: newStatuses });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.types || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    updateFilters({ types: newTypes });
  };

  const handleDepartmentChange = (dept: string, checked: boolean) => {
    const currentDepts = filters.departments || [];
    const newDepts = checked 
      ? [...currentDepts, dept]
      : currentDepts.filter(d => d !== dept);
    updateFilters({ departments: newDepts });
  };

  const activeFilterCount = [
    filters.status?.length || 0,
    filters.types?.length || 0,
    filters.departments?.length || 0,
    filters.searchTerm ? 1 : 0,
    filters.dateRange ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Erweiterte Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Weniger' : 'Mehr Filter'}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Suche nach Name, Grund..."
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(status => (
            <Label key={status.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.status?.includes(status.value) || false}
                onCheckedChange={(checked) => handleStatusChange(status.value, checked as boolean)}
              />
              <Badge className={status.color}>{status.label}</Badge>
            </Label>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zeitraum
              </Label>
              <Input
                placeholder="Zeitraum auswählen..."
                value={filters.dateRange ? 
                  `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}` : 
                  ''
                }
                readOnly
              />
            </div>

            {/* Types */}
            <div className="space-y-2">
              <Label>Abwesenheitstyp</Label>
              <div className="space-y-2">
                {TYPE_OPTIONS.map(type => (
                  <Label key={type.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.types?.includes(type.value) || false}
                      onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                    />
                    {type.label}
                  </Label>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Abteilung
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {departments.map(dept => (
                  <Label key={dept} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.departments?.includes(dept) || false}
                      onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                    />
                    {dept}
                  </Label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Priorität
              </Label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => updateFilters({ priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Prioritäten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Prioritäten</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {filters.status?.map(status => (
              <Badge key={status} variant="outline" className="gap-2">
                Status: {STATUS_OPTIONS.find(s => s.value === status)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleStatusChange(status, false)}
                />
              </Badge>
            ))}
            {filters.types?.map(type => (
              <Badge key={type} variant="outline" className="gap-2">
                Typ: {TYPE_OPTIONS.find(t => t.value === type)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleTypeChange(type, false)}
                />
              </Badge>
            ))}
            {filters.departments?.map(dept => (
              <Badge key={dept} variant="outline" className="gap-2">
                Abteilung: {dept}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleDepartmentChange(dept, false)}
                />
              </Badge>
            ))}
            {filters.searchTerm && (
              <Badge variant="outline" className="gap-2">
                Suche: {filters.searchTerm}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ searchTerm: '' })}
                />
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="outline" className="gap-2">
                Zeitraum: {filters.dateRange.start.toLocaleDateString()} - {filters.dateRange.end.toLocaleDateString()}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ dateRange: undefined })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};