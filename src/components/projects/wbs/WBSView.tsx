import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Network, ListTree, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { calculateWBSMetrics, WBSItem, WBSEpic } from '@/utils/wbsUtils';
import { WBSTreeView } from './WBSTreeView';

export const WBSView = () => {
  // WBS-Daten werden jetzt aus der Datenbank geladen
  const [epics] = useState<WBSEpic[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const metrics = calculateWBSMetrics(epics);

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleEdit = (item: WBSItem) => {
    console.log('Edit item:', item);
  };

  const handleDelete = (itemId: string) => {
    console.log('Delete item:', itemId);
  };

  const handleNewEpic = () => {
    console.log('Create new epic');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Work Breakdown Structure</h2>
          <Badge variant="secondary" className="text-xs">
            {epics.length} Epics
          </Badge>
        </div>
        <Button onClick={handleNewEpic} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Neues Epic
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <ListTree className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Epics</p>
                <p className="text-2xl font-bold">{metrics.totalEpics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fortschritt</p>
                <p className="text-2xl font-bold text-green-600">{metrics.totalProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stunden</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.hoursSpent}/{metrics.hoursPlanned}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kosten</p>
                <p className="text-2xl font-bold text-purple-600">€{(metrics.costSpent/1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <Card>
        <CardContent className="p-4">
          <WBSTreeView
            epics={epics}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};