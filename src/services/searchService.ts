
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'task' | 'goal';
  modified_at: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  progress?: number;
}

export const searchService = {
  async searchAll(query: string, filters?: {
    types?: string[];
    dateFrom?: string;
    dateTo?: string;
    author?: string;
    tags?: string[];
  }): Promise<SearchResult[]> {
    try {
      // Verwende die bestehende search_all Funktion
      const { data, error } = await supabase.rpc('search_all', {
        search_query: query
      });

      if (error) {
        console.error('Fehler bei der Suche:', error);
        return [];
      }

      // Konvertiere die Datenbank-Ergebnisse in das erwartete Format
      const results: SearchResult[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as 'document' | 'task' | 'goal',
        modified_at: item.modified_at
      }));

      // Filtere die Ergebnisse basierend auf den Filtern
      let filteredResults = results;

      if (filters?.types && filters.types.length > 0) {
        filteredResults = filteredResults.filter(result => 
          filters.types!.includes(result.type)
        );
      }

      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredResults = filteredResults.filter(result => 
          new Date(result.modified_at) >= fromDate
        );
      }

      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredResults = filteredResults.filter(result => 
          new Date(result.modified_at) <= toDate
        );
      }

      return filteredResults;
    } catch (error) {
      console.error('Fehler beim Ausführen der Suche:', error);
      return [];
    }
  }
};
