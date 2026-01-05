import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LayoutGrid, List, ArrowUpDown, Loader2 } from 'lucide-react';
import IdeaPoolCard from '../IdeaPoolCard';
import IdeaPoolListItem from '../IdeaPoolListItem';
import NewIdeaSubmissionDialog from '../NewIdeaSubmissionDialog';
import { IdeaDetailDialog } from '../IdeaDetailDialog';

const statusOptions = [
  { value: 'all', label: 'Alle Status' },
  { value: 'new', label: 'Neu' },
  { value: 'in_discussion', label: 'In Diskussion' },
  { value: 'evaluation', label: 'In Bewertung' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'experiment', label: 'Experiment' },
  { value: 'implementation', label: 'Umsetzung' },
  { value: 'scaled', label: 'Skaliert' },
];

const categoryOptions = [
  { value: 'all', label: 'Alle Kategorien' },
  { value: 'process', label: 'Prozess' },
  { value: 'product', label: 'Produkt' },
  { value: 'service', label: 'Service' },
  { value: 'technology', label: 'Technologie' },
  { value: 'organization', label: 'Organisation' },
  { value: 'sustainability', label: 'Nachhaltigkeit' },
  { value: 'cost', label: 'Kosten / Effizienz' },
];

const sortOptions = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'oldest', label: 'Älteste zuerst' },
  { value: 'votes', label: 'Meiste Stimmen' },
  { value: 'comments', label: 'Meiste Kommentare' },
  { value: 'score', label: 'Höchste Bewertung' },
];

interface IdeaData {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  tags: string[];
  submittedBy: string;
  team: string;
  votes: number;
  comments: number;
  date: string;
  score: number | null;
}

const InnovationIdeenpoolTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [perPage, setPerPage] = useState('12');
  const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaData | null>(null);

  // Lade Ideen aus der Datenbank
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['innovation-ideas-pool'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(idea => ({
        id: idea.id,
        title: idea.title || '',
        description: idea.description || '',
        status: idea.status || 'new',
        category: idea.category || 'process',
        tags: Array.isArray(idea.tags) ? idea.tags : [],
        submittedBy: idea.submitted_by_name || 'Unbekannt',
        team: idea.department || 'Unbekannt',
        votes: idea.votes_count || 0,
        comments: idea.comments_count || 0,
        date: idea.created_at ? new Date(idea.created_at).toLocaleDateString('de-DE') : '',
        score: idea.score || null,
      }));
    }
  });

  // Filter und Sortierung anwenden
  const filteredIdeas = ideas.filter((idea: IdeaData) => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter-Bereich */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Suchfeld */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ideen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Kategorien Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {filteredIdeas.length} Ideen gefunden
        </span>
        
        <div className="flex items-center gap-3">
          {/* Sortieren */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Pro Seite */}
          <Select value={perPage} onValueChange={setPerPage}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">pro Seite</span>
        </div>
      </div>

      {/* Content */}
      {filteredIdeas.length === 0 ? (
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Keine Ideen gefunden</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIdeas.map((idea: IdeaData) => (
            <IdeaPoolCard
              key={idea.id}
              idea={idea}
              onClick={() => setSelectedIdea(idea)}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredIdeas.map((idea: IdeaData) => (
                <IdeaPoolListItem
                  key={idea.id}
                  idea={idea}
                  onClick={() => setSelectedIdea(idea)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Idea Dialog */}
      <NewIdeaSubmissionDialog
        open={isNewIdeaDialogOpen}
        onOpenChange={setIsNewIdeaDialogOpen}
      />

      {/* Idea Detail Dialog */}
      {selectedIdea && (
        <IdeaDetailDialog
          idea={{
            ...selectedIdea,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          open={!!selectedIdea}
          onOpenChange={(open) => !open && setSelectedIdea(null)}
        />
      )}
    </div>
  );
};

export default InnovationIdeenpoolTab;
