import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  TrendingUp,
  Award,
  Wallet,
  Star
} from 'lucide-react';
import { useRewardCatalog, useDeleteRewardCatalogItem } from '@/hooks/useRewardCatalog';
import { useRewardStatistics } from '@/hooks/useRewardStatistics';
import { CreateRewardDialog } from './CreateRewardDialog';
import { EditRewardDialog } from './EditRewardDialog';
import { 
  RewardCatalogItem, 
  RewardCategory, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  FREQUENCY_LABELS 
} from '@/types/reward-catalog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const RewardsCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardCatalogItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: rewards, isLoading } = useRewardCatalog();
  const { data: stats } = useRewardStatistics();
  const deleteMutation = useDeleteRewardCatalogItem();

  const categories: Array<{ key: RewardCategory | 'all'; label: string }> = [
    { key: 'all', label: 'Alle' },
    { key: 'financial', label: 'Finanziell' },
    { key: 'non_financial', label: 'Nicht-finanziell' },
    { key: 'experience', label: 'Erlebnis' },
    { key: 'recognition', label: 'Anerkennung' },
  ];

  const filteredRewards = rewards?.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktive Belohnungen</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRewards || 0}</div>
            <p className="text-xs text-muted-foreground">von {stats?.totalCatalogRewards || 0} gesamt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eingelöst (Monat)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.redeemedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.redeemedChange && stats.redeemedChange > 0 ? '+' : ''}{stats?.redeemedChange || 0}% vs. Vormonat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbudget</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{((stats?.budgetTotal || 0) / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">{stats?.budgetPercentage || 0}% genutzt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Beliebteste</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats?.mostPopular?.name || '—'}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.mostPopular?.count ? `${stats.mostPopular.count} Einlösungen` : 'Keine Daten'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Belohnungen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Belohnung
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat.key}
            variant={selectedCategory === cat.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Lädt...</div>
      ) : filteredRewards.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Belohnungen gefunden</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              Erste Belohnung erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map(reward => (
            <Card key={reward.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{reward.name}</CardTitle>
                      <Badge className={CATEGORY_COLORS[reward.category]} variant="secondary">
                        {CATEGORY_LABELS[reward.category]}
                      </Badge>
                    </div>
                  </div>
                  {reward.is_active && (
                    <Badge variant="default" className="bg-green-600">Aktiv</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reward.description || 'Keine Beschreibung'}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Wert:</span> {reward.value_display}</div>
                  <div><span className="text-muted-foreground">Häufigkeit:</span> {FREQUENCY_LABELS[reward.frequency || 'once']}</div>
                  <div><span className="text-muted-foreground">Budget:</span> {reward.budget ? `€${reward.budget}` : 'N/A'}</div>
                  <div><span className="text-muted-foreground">Eingelöst:</span> {reward.redemption_count}</div>
                </div>

                {reward.eligibility && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <strong>Berechtigung:</strong> {reward.eligibility}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingReward(reward)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Bearbeiten
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeletingId(reward.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateRewardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditRewardDialog open={!!editingReward} onOpenChange={() => setEditingReward(null)} reward={editingReward} />
      
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Belohnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
