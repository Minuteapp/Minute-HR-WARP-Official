import React, { useState, useMemo } from 'react';
import { CostCentersKPICards } from '../costcenters/CostCentersKPICards';
import { Top10CostCentersChart } from '../costcenters/Top10CostCentersChart';
import { BudgetDistributionChart } from '../costcenters/BudgetDistributionChart';
import { CostCentersFilterBar } from '../costcenters/CostCentersFilterBar';
import { CostCentersHierarchy } from '../costcenters/CostCentersHierarchy';
import { EmployeeStatistics } from '../costcenters/EmployeeStatistics';
import { HierarchyPagination } from '../costcenters/HierarchyPagination';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 10;

export const CostCentersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: costCenters } = useQuery({
    queryKey: ['cost-centers-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Get unique departments and locations
  const departments = useMemo(() => {
    const depts = new Set(costCenters?.map(cc => cc.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, [costCenters]);

  const locations = useMemo(() => {
    const locs = new Set(costCenters?.map(cc => cc.location).filter(Boolean));
    return Array.from(locs) as string[];
  }, [costCenters]);

  // Filter cost centers
  const filteredCostCenters = useMemo(() => {
    return costCenters?.filter(cc => {
      const matchesSearch = !searchTerm || 
        cc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || cc.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || cc.location === selectedLocation;
      const matchesStatus = selectedStatus === 'all' || cc.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesLocation && matchesStatus;
    }) || [];
  }, [costCenters, searchTerm, selectedDepartment, selectedLocation, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredCostCenters.length / ITEMS_PER_PAGE);
  const paginatedCostCenters = filteredCostCenters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <CostCentersKPICards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Top10CostCentersChart />
        <BudgetDistributionChart />
      </div>

      {/* Filter Bar */}
      <CostCentersFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        departments={departments}
        locations={locations}
        totalCount={costCenters?.length || 0}
        filteredCount={filteredCostCenters.length}
      />

      {/* Hierarchy */}
      <CostCentersHierarchy costCenters={paginatedCostCenters} />

      {/* Pagination */}
      <HierarchyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Employee Statistics */}
      <EmployeeStatistics />
    </div>
  );
};
