import { useLocation } from 'react-router-dom';
import SearchBar from '@/components/search/SearchBar';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { SearchFilters } from '@/components/search/AdvancedSearchFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'task' | 'goal';
  modified_at: string;
}

const SearchPage = () => {
  const location = useLocation();
  
  const searchResults = ((location.state?.results || []) as SearchResult[]).slice(0, 50);
  const searchQuery = location.state?.query || '';
  const isLoading = !location.state?.results && searchQuery;
  const totalCount = location.state?.totalCount || 0;
  const filters = location.state?.filters as SearchFilters || null;

  // Zählen der verschiedenen Typen
  const typeCounts = searchResults.reduce((acc: Record<string, number>, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {});

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'document':
        return 'Dokument';
      case 'task':
        return 'Aufgabe';
      case 'goal':
        return 'Ziel';
      default:
        return type;
    }
  };

  // Typ-Labels für die Tabs
  const getTypeTabLabel = (type: string) => {
    const count = typeCounts[type] || 0;
    return `${getTypeLabel(type)}e${count > 0 ? ` (${count})` : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SearchBar />
      
      <div className="max-w-2xl mx-auto px-6">
        {searchQuery && (
          <h2 className="text-lg font-semibold mb-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Suche nach "{searchQuery}"...</span>
              </div>
            ) : (
              <>
                {searchResults.length} Suchergebnisse für "{searchQuery}"
                {searchResults.length < totalCount && 
                  ` (${totalCount - searchResults.length} weitere gefunden)`}
              </>
            )}
          </h2>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : (
          searchResults.length === 0 && searchQuery ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Keine Ergebnisse gefunden</h3>
              <p className="text-gray-500">
                Keine Ergebnisse gefunden für "{searchQuery}"
                {filters && Object.values(filters).some(v => 
                  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
                ) && " mit den ausgewählten Filtern"}
              </p>
            </div>
          ) : (
            searchResults.length > 0 && (
              <Tabs defaultValue="all" className="mb-8">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Alle ({searchResults.length})</TabsTrigger>
                  {typeCounts['document'] > 0 && <TabsTrigger value="document">{getTypeTabLabel('document')}</TabsTrigger>}
                  {typeCounts['task'] > 0 && <TabsTrigger value="task">{getTypeTabLabel('task')}</TabsTrigger>}
                  {typeCounts['goal'] > 0 && <TabsTrigger value="goal">{getTypeTabLabel('goal')}</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="all">
                  <ResultsList results={searchResults} />
                </TabsContent>
                
                {typeCounts['document'] > 0 && (
                  <TabsContent value="document">
                    <ResultsList results={searchResults.filter(r => r.type === 'document')} />
                  </TabsContent>
                )}
                
                {typeCounts['task'] > 0 && (
                  <TabsContent value="task">
                    <ResultsList results={searchResults.filter(r => r.type === 'task')} />
                  </TabsContent>
                )}
                
                {typeCounts['goal'] > 0 && (
                  <TabsContent value="goal">
                    <ResultsList results={searchResults.filter(r => r.type === 'goal')} />
                  </TabsContent>
                )}
              </Tabs>
            )
          )
        )}
      </div>
    </div>
  );
};

interface ResultsListProps {
  results: SearchResult[];
}

const ResultsList = ({ results }: ResultsListProps) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'document':
        return 'Dokument';
      case 'task':
        return 'Aufgabe';
      case 'goal':
        return 'Ziel';
      default:
        return type;
    }
  };

  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-4">
        {results.map((result) => (
          <Card 
            key={result.id} 
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-[#9b87f5]/30"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{result.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 capitalize">
                    {getTypeLabel(result.type)}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(result.modified_at), 'dd. MMMM yyyy', { locale: de })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SearchPage;
