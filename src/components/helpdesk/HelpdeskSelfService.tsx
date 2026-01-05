import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Receipt, Send, Calendar, Sparkles } from "lucide-react";
import { useHRChat } from '@/hooks/useHRChat';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserVacationData, useUserProfile } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";

export const HelpdeskSelfService = () => {
  const { messages, input, setInput, isLoading, handleSend } = useHRChat();
  const { data: vacationData, isLoading: vacationLoading } = useUserVacationData();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  const quickActions = [
    { icon: Calendar, label: "Urlaub beantragen", action: () => setInput("Ich möchte Urlaub beantragen") },
    { icon: FileText, label: "Lohnabrechnung", action: () => setInput("Ich habe eine Frage zur Lohnabrechnung") },
    { icon: MapPin, label: "Adresse ändern", action: () => setInput("Ich möchte meine Adresse ändern") },
    { icon: Receipt, label: "Spesen einreichen", action: () => setInput("Ich möchte Spesen einreichen") },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="h-[calc(100vh-250px)] flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className={message.sender === 'bot' ? 'bg-violet-500' : 'bg-blue-500'}>
                    <AvatarFallback className="text-white">
                      {message.sender === 'bot' ? 'AI' : getInitials(userProfile?.displayName || 'ME')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.sender === 'bot' ? 'KI-Assistent' : userProfile?.displayName || 'Sie'}
                      </span>
                      {message.sender === 'bot' && (
                        <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          KI
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div
                      className={`rounded-lg p-4 ${
                        message.sender === 'bot'
                          ? 'bg-muted border'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="bg-violet-500">
                    <AvatarFallback className="text-white">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Badge variant="outline" className="text-xs mb-2">Vorschau</Badge>
                    <div className="rounded-lg p-4 bg-muted border">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full" />
                        <p className="text-sm text-muted-foreground">
                          Ich verarbeite Ihre Anfrage...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="p-6 pt-4 border-t">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ihre Frage..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Schnellaktionen</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-3"
                      onClick={action.action}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Ihr Profil</h3>
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rolle:</span>
                  <span className="font-medium">{userProfile?.role || 'Mitarbeiter'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-medium">{userProfile?.team || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standort:</span>
                  <span className="font-medium">{userProfile?.location || '-'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vacation Account Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4" />
              <h3 className="font-semibold">Urlaubskonto</h3>
            </div>
            {vacationLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gesamt:</span>
                  <span className="font-medium">{vacationData?.total || 30} Tage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genommen:</span>
                  <span className="font-medium">{vacationData?.used || 0} Tage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verfügbar:</span>
                  <span className="font-semibold text-green-600">{vacationData?.remaining || 30} Tage</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};