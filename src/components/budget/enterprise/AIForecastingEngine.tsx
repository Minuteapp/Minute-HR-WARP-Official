import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Play,
  RefreshCw
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

interface AIForecastingEngineProps {
  selectedEntity: string;
  selectedCurrency: string;
}

export const AIForecastingEngine: React.FC<AIForecastingEngineProps> = ({
  selectedEntity,
  selectedCurrency
}) => {
  const [forecastHorizon, setForecastHorizon] = useState('12_months');
  const [modelType, setModelType] = useState('hybrid');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Model Performance Data
  const modelPerformance = {
    accuracy: 94.2,
    confidence: 87.5,
    lastTraining: '2024-01-10',
    dataPoints: 156789,
    predictionError: 3.8
  };

  // Forecast scenarios
  const forecastScenarios = [
    {
      name: 'Optimistic',
      probability: 20,
      revenue: 52000000,
      costs: 38500000,
      headcount: 10800,
      confidence: 78
    },
    {
      name: 'Realistic',
      probability: 60,
      revenue: 48500000,
      costs: 36200000,
      headcount: 10500,
      confidence: 94
    },
    {
      name: 'Pessimistic',
      probability: 20,
      revenue: 44000000,
      costs: 35800000,
      headcount: 10200,
      confidence: 85
    }
  ];

  // Historical vs AI Forecast Data
  const forecastData = [
    { month: 'Jan', actual: 3800000, aiPrediction: 3750000, traditionalForecast: 3900000, confidence: 92 },
    { month: 'Feb', actual: 3900000, aiPrediction: 3920000, traditionalForecast: 3850000, confidence: 94 },
    { month: 'Mar', actual: 4100000, aiPrediction: 4080000, traditionalForecast: 4000000, confidence: 96 },
    { month: 'Apr', actual: 3950000, aiPrediction: 3960000, traditionalForecast: 4050000, confidence: 93 },
    { month: 'May', actual: 4200000, aiPrediction: 4180000, traditionalForecast: 4100000, confidence: 95 },
    { month: 'Jun', actual: 4350000, aiPrediction: 4320000, traditionalForecast: 4200000, confidence: 97 },
    { month: 'Jul', actual: null, aiPrediction: 4400000, traditionalForecast: 4300000, confidence: 89 },
    { month: 'Aug', actual: null, aiPrediction: 4550000, traditionalForecast: 4450000, confidence: 87 },
    { month: 'Sep', actual: null, aiPrediction: 4600000, traditionalForecast: 4500000, confidence: 85 },
    { month: 'Oct', actual: null, aiPrediction: 4750000, traditionalForecast: 4650000, confidence: 83 },
    { month: 'Nov', actual: null, aiPrediction: 4900000, traditionalForecast: 4800000, confidence: 81 },
    { month: 'Dec', actual: null, aiPrediction: 5100000, traditionalForecast: 4950000, confidence: 79 }
  ];

  // External factors impact
  const externalFactors = [
    {
      factor: 'Inflation Rate',
      current: 3.2,
      trend: 'increasing',
      impact: 'medium',
      weighting: 15
    },
    {
      factor: 'Exchange Rates',
      current: 1.09,
      trend: 'stable',
      impact: 'high',
      weighting: 25
    },
    {
      factor: 'Labor Market',
      current: 4.1,
      trend: 'decreasing',
      impact: 'high',
      weighting: 30
    },
    {
      factor: 'Industry Growth',
      current: 6.8,
      trend: 'increasing',
      impact: 'medium',
      weighting: 20
    },
    {
      factor: 'Technology Adoption',
      current: 78,
      trend: 'increasing',
      impact: 'low',
      weighting: 10
    }
  ];

  // AI Insights
  const aiInsights = [
    {
      type: 'trend',
      title: 'Seasonal Cost Pattern Detected',
      description: 'Q4 personnel costs consistently 8% higher due to bonuses and holiday coverage',
      confidence: 96,
      impact: 'medium',
      recommendation: 'Consider budget reallocation for Q4 seasonal peaks'
    },
    {
      type: 'anomaly',
      title: 'Recruiting Cost Spike Predicted',
      description: 'Market conditions suggest 23% increase in recruiting costs for Q3-Q4',
      confidence: 87,
      impact: 'high',
      recommendation: 'Accelerate hiring in Q2 or increase recruiting budget by €180K'
    },
    {
      type: 'optimization',
      title: 'Training Budget Optimization',
      description: 'AI suggests reallocating 15% of training budget to high-ROI digital courses',
      confidence: 91,
      impact: 'low',
      recommendation: 'Potential savings of €45K annually with same learning outcomes'
    }
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${selectedCurrency} ${(value / 1000000).toFixed(1)}M`;
    }
    return `${selectedCurrency} ${(value / 1000).toFixed(0)}K`;
  };

  const generateForecast = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Engine Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Forecasting Engine
              <Badge variant="secondary">v2.1.4</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button onClick={generateForecast} disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Forecast'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{modelPerformance.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{modelPerformance.confidence}%</div>
              <div className="text-sm text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{modelPerformance.dataPoints.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{modelPerformance.predictionError}%</div>
              <div className="text-sm text-muted-foreground">Avg Error</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">5d</div>
              <div className="text-sm text-muted-foreground">Last Training</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Forecast Configuration:</span>
            </div>
            
            <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6_months">6 Months</SelectItem>
                <SelectItem value="12_months">12 Months</SelectItem>
                <SelectItem value="18_months">18 Months</SelectItem>
                <SelectItem value="24_months">24 Months</SelectItem>
              </SelectContent>
            </Select>

            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arima">ARIMA</SelectItem>
                <SelectItem value="lstm">LSTM Neural</SelectItem>
                <SelectItem value="prophet">Prophet</SelectItem>
                <SelectItem value="hybrid">Hybrid AI</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline" className="ml-auto">
              Entity: {selectedEntity.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecast">Forecast Results</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="external">External Factors</TabsTrigger>
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>AI vs Traditional Forecast Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aiPrediction" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="AI Forecast"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="traditionalForecast" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    strokeDasharray="10 5"
                    name="Traditional"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Confidence Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Confidence Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Confidence']} />
                  <Area 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenario Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecastScenarios.map((scenario, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {scenario.name}
                    <Badge variant={
                      scenario.name === 'Optimistic' ? 'default' :
                      scenario.name === 'Realistic' ? 'secondary' : 'destructive'
                    }>
                      {scenario.probability}% prob.
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="font-semibold">{formatCurrency(scenario.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Costs</span>
                      <span className="font-semibold">{formatCurrency(scenario.costs)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Headcount</span>
                      <span className="font-semibold">{scenario.headcount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profit</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(scenario.revenue - scenario.costs)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-sm font-medium">{scenario.confidence}%</span>
                    </div>
                    <Progress value={scenario.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scenario Impact Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Revenue Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastScenarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
                  <Bar dataKey="costs" name="Costs" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          {insight.type === 'trend' ? <TrendingUp className="h-4 w-4 text-blue-600" /> :
                           insight.type === 'anomaly' ? <AlertTriangle className="h-4 w-4 text-orange-600" /> :
                           <Zap className="h-4 w-4 text-green-600" />}
                        </div>
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge className={`${
                          insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{insight.description}</p>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-primary">AI Recommendation:</p>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold">{insight.confidence}%</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <Progress value={insight.confidence} className="w-16 h-2 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="external" className="space-y-6">
          {/* External Factors */}
          <Card>
            <CardHeader>
              <CardTitle>External Factor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {externalFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(factor.trend)}
                        <span className="font-semibold">{factor.factor}</span>
                      </div>
                      <Badge className={`${
                        factor.impact === 'high' ? 'bg-red-100 text-red-800' :
                        factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {factor.impact} impact
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-semibold">{factor.current}%</div>
                        <div className="text-sm text-muted-foreground">Current</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{factor.weighting}%</div>
                        <div className="text-sm text-muted-foreground">Weight</div>
                      </div>
                      
                      <div className="w-24">
                        <Progress value={factor.weighting * 4} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Factor Impact Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Factor Impact on Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={externalFactors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weighting" name="Weighting" />
                  <YAxis dataKey="current" name="Current Value" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'weighting' ? `${value}%` : `${value}`,
                      name === 'weighting' ? 'Weighting' : 'Current Value'
                    ]}
                    labelFormatter={(label) => `Factor: ${externalFactors[label]?.factor}`}
                  />
                  <Scatter dataKey="current" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Model Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Accuracy Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                  <Progress value={94.2} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    +2.1% vs last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Prediction Error</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3.8%</div>
                  <Progress value={96.2} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    -0.3% improvement
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Model Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">99.1%</div>
                  <Progress value={99.1} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    System uptime
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Model Type</th>
                      <th className="text-center py-3">Accuracy</th>
                      <th className="text-center py-3">Speed</th>
                      <th className="text-center py-3">Memory</th>
                      <th className="text-center py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 font-semibold">Hybrid AI (Current)</td>
                      <td className="text-center py-3">94.2%</td>
                      <td className="text-center py-3">Fast</td>
                      <td className="text-center py-3">2.1GB</td>
                      <td className="text-center py-3">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">LSTM Neural Network</td>
                      <td className="text-center py-3">91.8%</td>
                      <td className="text-center py-3">Medium</td>
                      <td className="text-center py-3">1.8GB</td>
                      <td className="text-center py-3">
                        <Badge variant="secondary">Standby</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Prophet</td>
                      <td className="text-center py-3">89.3%</td>
                      <td className="text-center py-3">Fast</td>
                      <td className="text-center py-3">0.8GB</td>
                      <td className="text-center py-3">
                        <Badge variant="secondary">Available</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3">ARIMA</td>
                      <td className="text-center py-3">85.7%</td>
                      <td className="text-center py-3">Very Fast</td>
                      <td className="text-center py-3">0.2GB</td>
                      <td className="text-center py-3">
                        <Badge variant="secondary">Legacy</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};