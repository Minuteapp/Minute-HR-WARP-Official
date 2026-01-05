import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Globe, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell } from 'recharts';

interface Entity {
  id: string;
  name: string;
  country: string;
  employees: number;
}

interface MultiEntityViewProps {
  entities: Entity[];
  selectedCurrency: string;
  timeframe: string;
}

export const MultiEntityView: React.FC<MultiEntityViewProps> = ({
  entities,
  selectedCurrency,
  timeframe
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('budget');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Extended entity data with financial information
  const entityData = [
    {
      id: 'global',
      name: 'Global Consolidated',
      country: 'Worldwide',
      region: 'Global',
      employees: 10247,
      budget: 125000000,
      used: 98500000,
      forecast: 122000000,
      variance: -2400000,
      currency: 'EUR',
      status: 'on_track',
      complianceScore: 98,
      lastSync: '2024-01-15T10:30:00Z',
      kpis: {
        costPerEmployee: 12212,
        utilizationRate: 78.8,
        growthRate: 4.2,
        efficiencyScore: 92
      }
    },
    {
      id: 'emea',
      name: 'EMEA Region',
      country: 'Europe',
      region: 'EMEA',
      employees: 4521,
      budget: 45000000,
      used: 34200000,
      forecast: 43500000,
      variance: -1500000,
      currency: 'EUR',
      status: 'on_track',
      complianceScore: 96,
      lastSync: '2024-01-15T10:25:00Z',
      kpis: {
        costPerEmployee: 10085,
        utilizationRate: 76.0,
        growthRate: 3.8,
        efficiencyScore: 89
      }
    },
    {
      id: 'apac',
      name: 'APAC Region',
      country: 'Asia-Pacific',
      region: 'APAC',
      employees: 3876,
      budget: 38000000,
      used: 29800000,
      forecast: 37200000,
      variance: -800000,
      currency: 'USD',
      status: 'at_risk',
      complianceScore: 94,
      lastSync: '2024-01-15T10:28:00Z',
      kpis: {
        costPerEmployee: 9806,
        utilizationRate: 78.4,
        growthRate: 5.1,
        efficiencyScore: 91
      }
    },
    {
      id: 'americas',
      name: 'Americas',
      country: 'North/South America',
      region: 'Americas',
      employees: 1850,
      budget: 42000000,
      used: 34600000,
      forecast: 41000000,
      variance: -1000000,
      currency: 'USD',
      status: 'over_budget',
      complianceScore: 88,
      lastSync: '2024-01-15T10:32:00Z',
      kpis: {
        costPerEmployee: 22703,
        utilizationRate: 82.4,
        growthRate: 2.9,
        efficiencyScore: 85
      }
    },
    {
      id: 'germany',
      name: 'Germany GmbH',
      country: 'Germany',
      region: 'EMEA',
      employees: 2100,
      budget: 18500000,
      used: 14200000,
      forecast: 17800000,
      variance: -700000,
      currency: 'EUR',
      status: 'on_track',
      complianceScore: 99,
      lastSync: '2024-01-15T10:20:00Z',
      kpis: {
        costPerEmployee: 8810,
        utilizationRate: 76.8,
        growthRate: 3.2,
        efficiencyScore: 94
      }
    },
    {
      id: 'usa',
      name: 'USA Inc.',
      country: 'United States',
      region: 'Americas',
      employees: 1200,
      budget: 28000000,
      used: 23400000,
      forecast: 27500000,
      variance: -500000,
      currency: 'USD',
      status: 'on_track',
      complianceScore: 92,
      lastSync: '2024-01-15T10:35:00Z',
      kpis: {
        costPerEmployee: 23333,
        utilizationRate: 83.6,
        growthRate: 4.8,
        efficiencyScore: 87
      }
    }
  ];

  // Currency conversion (simplified for demo)
  const convertToCurrency = (amount: number, fromCurrency: string) => {
    if (fromCurrency === selectedCurrency) return amount;
    if (fromCurrency === 'USD' && selectedCurrency === 'EUR') return amount * 0.92;
    if (fromCurrency === 'EUR' && selectedCurrency === 'USD') return amount * 1.09;
    return amount;
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const convertedAmount = convertToCurrency(amount, currency || selectedCurrency);
    if (convertedAmount >= 1000000) {
      return `${selectedCurrency} ${(convertedAmount / 1000000).toFixed(1)}M`;
    }
    return `${selectedCurrency} ${(convertedAmount / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'over_budget': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="h-4 w-4" />;
      case 'at_risk': return <Clock className="h-4 w-4" />;
      case 'over_budget': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  // Filter and sort entities
  const filteredEntities = entityData
    .filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entity.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a] as number;
      const bValue = b[sortField as keyof typeof b] as number;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // Consolidation data for charts
  const consolidationData = entityData.map(entity => ({
    name: entity.name.split(' ')[0],
    budget: convertToCurrency(entity.budget, entity.currency),
    used: convertToCurrency(entity.used, entity.currency),
    forecast: convertToCurrency(entity.forecast, entity.currency),
    variance: convertToCurrency(entity.variance, entity.currency)
  }));

  // Regional summary
  const regionalSummary = entityData.reduce((acc: any, entity) => {
    if (entity.id === 'global') return acc;
    
    if (!acc[entity.region]) {
      acc[entity.region] = {
        budget: 0,
        used: 0,
        employees: 0,
        entities: 0
      };
    }
    
    acc[entity.region].budget += convertToCurrency(entity.budget, entity.currency);
    acc[entity.region].used += convertToCurrency(entity.used, entity.currency);
    acc[entity.region].employees += entity.employees;
    acc[entity.region].entities += 1;
    
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="over_budget">Over Budget</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="employees">Employees</SelectItem>
                  <SelectItem value="complianceScore">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{filteredEntities.length} entities</span>
              <span>•</span>
              <span>{filteredEntities.reduce((sum, e) => sum + e.employees, 0).toLocaleString()} employees</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Entity Overview</TabsTrigger>
          <TabsTrigger value="consolidation">Consolidation</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Entity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEntities.map((entity) => (
              <Card key={entity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {entity.name}
                    </CardTitle>
                    <Badge className={getStatusColor(entity.status)}>
                      {getStatusIcon(entity.status)}
                      <span className="ml-1">
                        {entity.status === 'on_track' ? 'On Track' :
                         entity.status === 'at_risk' ? 'At Risk' : 'Over Budget'}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entity.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {entity.employees.toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Budget Overview */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Budget Utilization</span>
                      <span className="text-sm text-muted-foreground">
                        {((entity.used / entity.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(entity.used / entity.budget) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(entity.used, entity.currency)}</span>
                      <span>{formatCurrency(entity.budget, entity.currency)}</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold">
                        {formatCurrency(entity.kpis.costPerEmployee, entity.currency).replace(/[^\d.,]/g, '')}
                      </div>
                      <div className="text-xs text-muted-foreground">Cost/Employee</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold">{entity.complianceScore}%</div>
                      <div className="text-xs text-muted-foreground">Compliance</div>
                    </div>
                  </div>

                  {/* Variance */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Forecast Variance</span>
                    <div className="flex items-center gap-1">
                      {entity.variance < 0 ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        entity.variance < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(Math.abs(entity.variance), entity.currency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consolidation" className="space-y-6">
          {/* Regional Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(regionalSummary).map(([region, data]: [string, any]) => (
              <Card key={region}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {region}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Budget</span>
                      <span className="font-semibold">{formatCurrency(data.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Used</span>
                      <span className="font-semibold">{formatCurrency(data.used)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Employees</span>
                      <span className="font-semibold">{data.employees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entities</span>
                      <span className="font-semibold">{data.entities}</span>
                    </div>
                    <Progress value={(data.used / data.budget) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Consolidation Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Global Budget Consolidation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={consolidationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="budget" name="Budget" fill="#94A3B8" />
                  <Bar dataKey="used" name="Used" fill="#3B82F6" />
                  <Bar dataKey="forecast" name="Forecast" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Entity Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Entity Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">Entity</th>
                      <th className="text-right py-3 font-semibold">Budget</th>
                      <th className="text-right py-3 font-semibold">Used %</th>
                      <th className="text-right py-3 font-semibold">Cost/Employee</th>
                      <th className="text-right py-3 font-semibold">Efficiency</th>
                      <th className="text-right py-3 font-semibold">Growth Rate</th>
                      <th className="text-center py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntities.map((entity) => (
                      <tr key={entity.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{entity.name}</div>
                            <div className="text-xs text-muted-foreground">{entity.country}</div>
                          </div>
                        </td>
                        <td className="text-right py-3">{formatCurrency(entity.budget, entity.currency)}</td>
                        <td className="text-right py-3">
                          {((entity.used / entity.budget) * 100).toFixed(1)}%
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(entity.kpis.costPerEmployee, entity.currency).replace(/[^\d.,]/g, '')}
                        </td>
                        <td className="text-right py-3">{entity.kpis.efficiencyScore}%</td>
                        <td className="text-right py-3">
                          <div className="flex items-center justify-end gap-1">
                            {entity.kpis.growthRate >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span>{entity.kpis.growthRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="text-center py-3">
                          <Badge className={`${getStatusColor(entity.status)} text-xs`}>
                            {entity.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Compliance</p>
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Audit-Ready</p>
                    <p className="text-2xl font-bold">5/6</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Issues</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Sync</p>
                    <p className="text-2xl font-bold">2min</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Entity Compliance Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntities.map((entity) => (
                  <div key={entity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{entity.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last sync: {new Date(entity.lastSync).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold">{entity.complianceScore}%</div>
                        <div className="text-sm text-muted-foreground">Compliance Score</div>
                      </div>
                      <div className="w-24">
                        <Progress value={entity.complianceScore} className="h-2" />
                      </div>
                      {entity.complianceScore >= 95 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : entity.complianceScore >= 90 ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};