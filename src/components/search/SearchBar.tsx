
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import type { SearchFilters } from './AdvancedSearchFilters';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    dateFrom: '',
    dateTo: '',
    author: '',
    tags: []
  });
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    // Keine Mock-Ergebnisse - echte Suchergebnisse werden aus der Datenbank geladen
    navigate('/search', {
      state: {
        query,
        results: [],
        totalCount: 0,
        filters
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Suchen Sie nach Dokumenten, Aufgaben, Zielen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={!query.trim()}>
            Suchen
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && <span className="ml-1 text-xs">●</span>}
          </Button>
        </div>
        
        {showFilters && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Filter</h3>
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SearchBar;
