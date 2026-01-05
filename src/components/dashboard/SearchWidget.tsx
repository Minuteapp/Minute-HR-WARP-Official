
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Users, Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'employee' | 'document' | 'event';
  url: string;
  description?: string;
}

const SearchWidget = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldSearch, setShouldSearch] = useState(false);
  const navigate = useNavigate();
  const { isSuperAdmin } = useTenant();
  
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['dashboard-search', searchQuery, isSuperAdmin],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      // Superadmin ohne Tenant-Kontext: keine tenant-spezifischen Daten anzeigen
      if (isSuperAdmin) return [];
      
      const results: SearchResult[] = [];
      
      try {
        // Suche in Projekten
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, description')
          .ilike('name', `%${searchQuery}%`)
          .limit(3);
        
        if (projects) {
          results.push(...projects.map(p => ({
            id: p.id,
            title: p.name,
            type: 'project' as const,
            url: `/projects/${p.id}`,
            description: p.description
          })));
        }
        
        // Suche in Kalenderterminen
        const { data: events } = await supabase
          .from('calendar_events')
          .select('id, title, description')
          .ilike('title', `%${searchQuery}%`)
          .is('deleted_at', null)
          .limit(3);
        
        if (events) {
          results.push(...events.map(e => ({
            id: e.id,
            title: e.title,
            type: 'event' as const,
            url: `/calendar?eventId=${e.id}`,
            description: e.description
          })));
        }
        
        // KEIN Mock-/Fallback: wenn nichts gefunden, bleibt es leer
        return results;
      } catch (error) {
        console.error('Suchfehler:', error);
        // KEIN Fallback
        return [];
      }
    },
    enabled: shouldSearch && searchQuery.trim().length > 0
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setShouldSearch(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'employee': return <Users className="h-4 w-4 text-green-600" />;
      case 'document': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-orange-600" />;
      default: return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Projekt';
      case 'employee': return 'Mitarbeiter';
      case 'document': return 'Dokument';
      case 'event': return 'Termin';
      default: return type;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Search className="h-4 w-4" />
          Suche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShouldSearch(false);
            }}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            size="sm"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div className="text-xs text-gray-500 mb-2">
              {searchResults.length} Ergebnis(se) gefunden
            </div>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="p-2 rounded border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(result.url)}
              >
                <div className="flex items-center gap-2">
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTypeLabel(result.type)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {shouldSearch && searchQuery && searchResults.length === 0 && !isLoading && (
          <div className="text-center text-sm text-gray-500 py-2">
            Keine Ergebnisse für "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchWidget;
