import { useState } from 'react';
import ProjectListStats from '../project-list/ProjectListStats';
import ProjectListFilters from '../project-list/ProjectListFilters';
import ProjectListToolbar from '../project-list/ProjectListToolbar';
import EnterpriseProjectList from '../project-list/EnterpriseProjectList';
import EnterpriseProjectGrid from '../project-list/EnterpriseProjectGrid';
import ProjectListPagination from '../project-list/ProjectListPagination';

const ProjectListTab = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ProjectListStats />
      
      {/* Filters */}
      <ProjectListFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />
      
      {/* Toolbar */}
      <ProjectListToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />
      
      {/* Project List/Grid */}
      {viewMode === 'list' ? (
        <EnterpriseProjectList />
      ) : (
        <EnterpriseProjectGrid />
      )}
      
      {/* Pagination */}
      <ProjectListPagination
        currentPage={currentPage}
        totalPages={1}
        totalItems={0}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProjectListTab;
