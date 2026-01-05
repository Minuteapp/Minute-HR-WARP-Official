import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Search,
  Loader2
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useBudgetRealData } from '@/hooks/useBudgetRealData';

interface NaturalLanguageInterfaceProps {
  selectedEntity: string;
  selectedCurrency: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
  chartType?: 'line' | 'area' | 'bar' | 'pie';
}

export const NaturalLanguageInterface: React.FC<NaturalLanguageInterfaceProps> = ({
  selectedEntity,
  selectedCurrency
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Echte Daten aus der Datenbank
  const { 
    personnelCosts, 
    recruitingCosts, 
    trainingCosts, 
    budgetUtilization, 
    headcountGrowth,
    monthlyData,
    isLoading 
  } = useBudgetRealData();

  const quickQuestions = [
    "Zeige mir die Personalkostenprognose für das nächste Quartal",
    "Wie hoch sind die aktuellen Recruiting-Kosten?",
    "Wie ist die aktuelle Budget-Auslastung?",
    "Vergleiche Weiterbildungsbudgets zwischen Abteilungen",
    "Zeige Kostenentwicklung der letzten 6 Monate"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processQuery = async (inputQuery: string) => {
    if (!inputQuery.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputQuery,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const assistantMessage = generateAIResponse(inputQuery);
    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('personalkosten') || lowerQuery.includes('personnel') || lowerQuery.includes('gehalt')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Basierend auf den aktuellen Daten für ${selectedEntity}: Die Gesamtpersonalkosten betragen derzeit ${personnelCosts.toLocaleString('de-DE')} ${selectedCurrency} pro Monat. Das Headcount-Wachstum liegt bei ${headcountGrowth}%.`,
        timestamp: new Date(),
        data: monthlyData.length > 0 ? monthlyData : undefined,
        chartType: monthlyData.length > 0 ? 'area' : undefined
      };
    }

    if (lowerQuery.includes('recruiting') || lowerQuery.includes('neueinstellung') || lowerQuery.includes('hiring')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Recruiting-Analyse für ${selectedEntity}: Die aktuellen Recruiting-Kosten betragen ${recruitingCosts.toLocaleString('de-DE')} ${selectedCurrency}. Dies basiert auf den offenen Stellen und durchschnittlichen Kosten pro Einstellung.`,
        timestamp: new Date(),
        data: monthlyData.filter(d => d.recruiting > 0),
        chartType: 'bar'
      };
    }

    if (lowerQuery.includes('weiterbildung') || lowerQuery.includes('training') || lowerQuery.includes('schulung')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Weiterbildungsbudget: Die aktuellen monatlichen Trainingskosten betragen ${trainingCosts.toLocaleString('de-DE')} ${selectedCurrency}. Dies entspricht einem Durchschnitt von ca. 42 EUR pro Mitarbeiter.`,
        timestamp: new Date(),
        data: monthlyData.filter(d => d.training > 0),
        chartType: 'bar'
      };
    }

    if (lowerQuery.includes('budget') || lowerQuery.includes('auslastung')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Budget-Auslastung für ${selectedEntity}: Aktuell sind ${budgetUtilization}% des Budgets verbraucht. Die Personalkosten machen den größten Anteil aus.`,
        timestamp: new Date(),
        data: monthlyData,
        chartType: 'area'
      };
    }

    if (lowerQuery.includes('kosten') || lowerQuery.includes('entwicklung') || lowerQuery.includes('monat')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Kostenentwicklung der letzten 6 Monate: Personalkosten: ${personnelCosts.toLocaleString('de-DE')} ${selectedCurrency}, Recruiting: ${recruitingCosts.toLocaleString('de-DE')} ${selectedCurrency}, Training: ${trainingCosts.toLocaleString('de-DE')} ${selectedCurrency}.`,
        timestamp: new Date(),
        data: monthlyData,
        chartType: 'line'
      };
    }

    // Default response
    return {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `Analyse für "${query}": Aktuelle Gesamtkosten: ${(personnelCosts + recruitingCosts + trainingCosts).toLocaleString('de-DE')} ${selectedCurrency}. Budget-Auslastung: ${budgetUtilization}%.`,
      timestamp: new Date(),
      data: monthlyData.length > 0 ? monthlyData : undefined,
      chartType: monthlyData.length > 0 ? 'area' : undefined
    };
  };

  const renderChart = (message: Message) => {
    if (!message.data || !message.chartType || message.data.length === 0) return null;

    const chartHeight = 300;

    switch (message.chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={message.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${selectedCurrency} ${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [`${selectedCurrency} ${value.toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="personnel" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Personal" />
              <Area type="monotone" dataKey="recruiting" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Recruiting" />
              <Area type="monotone" dataKey="training" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Training" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={message.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${selectedCurrency} ${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [`${selectedCurrency} ${value.toLocaleString()}`, '']} />
              <Bar dataKey="total" fill="#3B82F6" name="Gesamt" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={message.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${selectedCurrency} ${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [`${selectedCurrency} ${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Gesamt" />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Natural Language Budget Intelligence
          <Badge variant="secondary" className="ml-2">Live-Daten</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-4">
            <ScrollArea className="h-96 border rounded-lg p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Stellen Sie eine Frage zu Ihren Budget-Daten in natürlicher Sprache.</p>
                    <p className="text-sm mt-2">z.B. "Zeige mir die Personalkostenprognose"</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                        {message.type === 'assistant' && message.data && (
                          <div className="mt-4 p-3 bg-background rounded border">
                            {renderChart(message)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analysiere Ihre Anfrage...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fragen Sie nach Budget-Daten, Prognosen, Analysen..."
                  onKeyPress={(e) => e.key === 'Enter' && processQuery(query)}
                  className="pr-12"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute right-1 top-1 h-8 w-8 ${isListening ? 'text-red-500' : ''}`}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                onClick={() => processQuery(query)} 
                disabled={isProcessing || !query.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions & Suggestions */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Häufige Fragen
              </h4>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left h-auto p-3 text-xs"
                    onClick={() => processQuery(question)}
                  >
                    <Search className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Live-Kennzahlen
              </h4>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded animate-pulse">
                      <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
                      <div className="h-4 w-12 bg-muted-foreground/20 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Budget-Auslastung
                    </span>
                    <span className="font-semibold">{budgetUtilization}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-blue-500" />
                      Headcount-Wachstum
                    </span>
                    <span className="font-semibold">{headcountGrowth > 0 ? '+' : ''}{headcountGrowth}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-purple-500" />
                      Personalkosten
                    </span>
                    <span className="font-semibold">{selectedCurrency} {(personnelCosts / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      Recruiting-Kosten
                    </span>
                    <span className="font-semibold">{selectedCurrency} {(recruitingCosts / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};