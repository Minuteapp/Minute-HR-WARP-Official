// Compliance Hub - Richtlinien & Policies Tab
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { PolicyCard, Policy } from './PolicyCard';

interface PoliciesTabProps {
  policies?: Policy[];
  categories?: string[];
  isLoading?: boolean;
  onCreateNew?: () => void;
  onDownload?: (policy: Policy) => void;
  onViewConfirmations?: (policy: Policy) => void;
  onRequestAIExplanation?: (policy: Policy) => void;
}

export const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies = [],
  categories = [],
  isLoading = false,
  onCreateNew,
  onDownload,
  onViewConfirmations,
  onRequestAIExplanation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Richtlinien & Policies</h2>
            <p className="text-sm text-muted-foreground">Zentrales Policy-Repository mit Versionierung</p>
          </div>
          <Button disabled className="bg-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Neue Richtlinie erstellen
          </Button>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Richtlinien & Policies</h2>
          <p className="text-sm text-muted-foreground">Zentrales Policy-Repository mit Versionierung</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Richtlinie erstellen
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Richtlinien durchsuchen..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Policy List */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Keine Richtlinien vorhanden</p>
          <p className="text-sm">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Keine Ergebnisse für die gewählten Filter gefunden.'
              : 'Erstellen Sie Ihre erste Richtlinie, um zu beginnen.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPolicies.map(policy => (
            <PolicyCard 
              key={policy.id} 
              policy={policy}
              onDownload={onDownload}
              onViewConfirmations={onViewConfirmations}
              onRequestAIExplanation={onRequestAIExplanation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
