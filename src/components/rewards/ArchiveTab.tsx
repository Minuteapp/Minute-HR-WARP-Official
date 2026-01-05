import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Archive, 
  Download, 
  Search, 
  Eye,
  FileSpreadsheet,
  FileText,
  Loader,
  TrendingUp,
  Award,
  DollarSign
} from 'lucide-react';
import { useRewardArchive } from '@/hooks/useRewardArchive';
import { 
  ArchiveFilters,
  archiveCategoryLabels,
  archiveCategoryColors
} from '@/types/reward-archive';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const ArchiveTab: React.FC = () => {
  const [filters, setFilters] = useState<ArchiveFilters>({});
  const { 
    archiveItems, 
    isLoading, 
    statistics, 
    availableYears,
    availableCategories,
    exportToCSV 
  } = useRewardArchive(filters);

  const kpiCards = [
    {
      title: 'Gesamt Belohnungen',
      value: statistics.totalRewards.toString(),
      icon: Archive,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Gesamtwert',
      value: `€${statistics.totalValue.toLocaleString('de-DE')}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ø pro Mitarbeiter',
      value: `€${statistics.avgPerEmployee.toLocaleString('de-DE')}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Häufigste Belohnung',
      value: statistics.mostFrequent.name,
      subtitle: `${statistics.mostFrequent.count}x`,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const exportOptions = [
    { name: 'CSV Export', icon: FileText, description: 'Komma-separierte Werte', action: exportToCSV },
    { name: 'Excel Export', icon: FileSpreadsheet, description: 'Microsoft Excel Format', action: exportToCSV },
    { name: 'PDF Report', icon: FileText, description: 'Druckbarer Bericht', action: exportToCSV },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Archiv</h2>
          <p className="text-muted-foreground">Historische Belohnungen und Export-Optionen</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Gesamtexport
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="text-sm text-muted-foreground">{kpi.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            className="pl-10"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <Select
          value={filters.year?.toString() || 'all'}
          onValueChange={(v) => setFilters({ ...filters, year: v === 'all' ? undefined : parseInt(v) })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Jahr" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Jahre</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.category || 'all'}
          onValueChange={(v) => setFilters({ ...filters, category: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {availableCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {archiveCategoryLabels[cat] || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Archive Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archivierte Belohnungen</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : archiveItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine archivierten Belohnungen vorhanden
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Datum</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Mitarbeiter</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Belohnung</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Wert</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Kategorie</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Abteilung</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Genehmigt von</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {archiveItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        {format(new Date(item.archive_date), 'dd.MM.yyyy', { locale: de })}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.employee_avatar} />
                            <AvatarFallback>
                              {item.employee_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.employee_name || 'Unbekannt'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{item.reward_name}</p>
                          {item.reward_description && (
                            <p className="text-sm text-muted-foreground">{item.reward_description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium">{item.value_display}</td>
                      <td className="py-3 px-2">
                        <Badge className={archiveCategoryColors[item.category] || 'bg-gray-100 text-gray-800'}>
                          {archiveCategoryLabels[item.category] || item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{item.department || '-'}</td>
                      <td className="py-3 px-2">{item.approved_by || '-'}</td>
                      <td className="py-3 px-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export-Optionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportOptions.map((option) => (
              <Card key={option.name} className="border-2 cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{option.name}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={option.action}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchiveTab;
