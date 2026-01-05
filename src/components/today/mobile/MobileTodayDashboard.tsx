import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, TrendingUp, AlertCircle, TrendingDown, Lightbulb, Clock, Calendar as CalendarIcon, Users, Activity, MapPin, CheckSquare } from "lucide-react";
import { MobileBottomNavigation } from '@/components/dashboard/MobileBottomNavigation';
import minuteLogo from '@/assets/minute-logo-4.png';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useTimeTracking } from '@/hooks/useTimeTracking';

const MobileTodayDashboard = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const timeTracking = useTimeTracking();
  const { notifications, unreadCount, markAsRead } = useUnifiedNotifications();
  
  // Mock-Daten
  const mockCalendarEvents: any[] = [];
  const mockTasks: any[] = [];
  const mockMessages: any[] = [];
  const mockProjects: any[] = [];
  const mockSystemTasks: any[] = [];

  const weekDays = [
    { day: 13, dots: 2, isToday: true },
    { day: 14, dots: 1 },
    { day: 15, dots: 1 },
    { day: 16, dots: 1 },
    { day: 17, dots: 1 },
    { day: 18, dots: 0 },
    { day: 19, dots: 0 },
  ];

  const monthDays = [
    { day: 1, dots: 1 }, { day: 2, dots: 0 }, { day: 3, dots: 0 }, { day: 4, dots: 0 }, { day: 5, dots: 1 },
    { day: 6, dots: 0 }, { day: 7, dots: 0 }, { day: 8, dots: 0 }, { day: 9, dots: 0 }, { day: 10, dots: 0 },
    { day: 11, dots: 0 }, { day: 12, dots: 0 }, { day: 13, dots: 3, isToday: true }, { day: 14, dots: 0 }, { day: 15, dots: 2 },
    { day: 16, dots: 0 }, { day: 17, dots: 0 }, { day: 18, dots: 0 }, { day: 19, dots: 0 }, { day: 20, dots: 1 },
    { day: 21, dots: 1 }, { day: 22, dots: 1 }, { day: 23, dots: 0 }, { day: 24, dots: 0 }, { day: 25, dots: 0 },
    { day: 26, dots: 0 }, { day: 27, dots: 0 }, { day: 28, dots: 2 }, { day: 29, dots: 0 }, { day: 30, dots: 0 },
    { day: 31, dots: 0 },
  ];

  const departmentAvailability = [
    { name: 'IT-Team', available: 39, total: 50, days: [8, 8, 7, 8, 8, '-', '-'] },
    { name: 'Marketing', available: 29, total: 35, days: [6, 6, 6, 5, 6, '-', '-'] },
    { name: 'Vertrieb', available: 57, total: 75, days: [12, 12, 11, 12, 10, '-', '-'] },
    { name: 'HR', available: 19, total: 25, days: [4, 4, 4, 3, 4, '-', '-'] },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E4FF] via-[#EEF2FF] to-[#E8E4FF] pb-24">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-[#2C3AD1] shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-white/60 text-[10px] font-medium">Vorschau</span>
          <img src={minuteLogo} alt="MINUTE" className="h-8" />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-2" align="end">
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Benachrichtigungen</h3>
                  {unreadCount > 0 && <Badge variant="destructive">{unreadCount} Neu</Badge>}
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Keine Benachrichtigungen</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors mb-2 ${
                          notification.read
                            ? 'bg-muted/50 hover:bg-muted'
                            : 'bg-primary/10 hover:bg-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-foreground">
                                {notification.title}
                              </span>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: de,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Subheader mit Datum und User Info */}
      <div className="bg-white border-b px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Heute ist Freitag, 14. November 2025 · Angemeldet als Administrator
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => setView('today')}
            className={`flex-1 rounded-none border-b-2 ${
              view === 'today' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Heute
          </Button>
          <Button
            variant="ghost"
            onClick={() => setView('week')}
            className={`flex-1 rounded-none border-b-2 ${
              view === 'week' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Woche
          </Button>
          <Button
            variant="ghost"
            onClick={() => setView('month')}
            className={`flex-1 rounded-none border-b-2 ${
              view === 'month' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Monat
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4 pt-4">
        {/* HEUTE Tab */}
        {view === 'today' && (
          <>
            {/* KI-Zusammenfassung */}
            <Card className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">KI-Zusammenfassung</h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Dein Tag in 60 Sekunden</p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">3 Aufgaben mit hoher Priorität</p>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">4 Meetings heute geplant</p>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">TestProjekt Q4 braucht Aufmerksamkeit</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 pt-2 border-t">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Beginne mit "Meeting-Follow-up" für maximalen Impact
                  </p>
                </div>
              </div>
            </Card>

            {/* Zeiterfassung */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Zeiterfassung</h2>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-mono font-bold text-foreground mb-1">
                  {formatTime(timeTracking.elapsedTime)}
                </div>
                <div className="text-xs text-muted-foreground">Nicht aktiv</div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Heute gestempelt</span>
                <span className="font-medium text-foreground">0,0h</span>
              </div>
            </Card>

            {/* Kalender */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Kalender</h2>
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-2">Di. 19. Aug.</p>
                <p className="text-sm text-muted-foreground mb-1">Anstehende Termine</p>
                <p className="text-sm text-muted-foreground">Abwesend: Daniel Haußlein</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>Grund: TEST (Urlaub Pending)</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">Kalender öffnen</Button>
            </Card>

            {/* Aufgaben */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Aufgaben</h2>
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="space-y-3">
                {mockTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-foreground">{task.title}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{task.status}</Badge>
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">Fällig: {task.dueDate}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">Alle Aufgaben anzeigen</Button>
            </Card>

            {/* Nachrichten */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Nachrichten</h2>
                <Badge variant="destructive">1 Neu</Badge>
              </div>
              
              <div className="space-y-3">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.color}>
                        {msg.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-foreground">{msg.sender}</p>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{msg.message}</p>
                    </div>
                    {msg.isNew && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">Alle Nachrichten</Button>
            </Card>

            {/* Projekte */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Projekte</h2>
              </div>
              
              {mockProjects.map((project) => (
                <div key={project.id} className="p-3 bg-muted/30 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">{project.name}</p>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{project.status}</Badge>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </Card>
          </>
        )}

        {/* WOCHE Tab */}
        {view === 'week' && (
          <>
            {/* Kalenderwoche Header */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Kalenderwoche 42</h2>
                  <p className="text-sm text-muted-foreground">13. - 19. Oktober 2025</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <TrendingDown className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="h-8 px-3">
                    Heute
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Wochen-KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Gesamt-Stunden<br/>(Team)</p>
                  <TrendingUp className="h-4 w-4 text-blue-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-blue-600">380.0 h</div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Offene Tickets</p>
                  <TrendingUp className="h-4 w-4 text-orange-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-orange-600">47</div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Aktive Nutzer</p>
                  <TrendingUp className="h-4 w-4 text-green-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-green-600">124</div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">System-Auslastung</p>
                  <TrendingUp className="h-4 w-4 text-purple-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-purple-600">87%</div>
              </Card>
            </div>

            {/* Wochen-Kalender */}
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                  <div key={day} className="text-center text-xs text-muted-foreground font-medium">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${
                      day.isToday ? 'bg-primary text-primary-foreground' : 'bg-card border hover:bg-muted'
                    }`}
                  >
                    <span className="text-lg font-medium">{day.day}</span>
                    {day.dots > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: Math.min(day.dots, 3) }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${day.isToday ? 'bg-primary-foreground' : 'bg-blue-600'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Tages-Details wenn Tag ausgewählt */}
            {selectedDay && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Mo, {selectedDay}. Okt</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                    Schließen
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Team Meeting Event */}
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <p className="font-medium text-foreground">Team Meeting</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>09:00 Uhr (1h)</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>Konferenzraum A</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-blue-600 text-blue-600">
                        Meeting
                      </Badge>
                    </div>
                  </div>

                  {/* Meeting Follow-up Event */}
                  <div className="p-3 bg-green-50 border-l-4 border-green-600 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                          <p className="font-medium text-foreground">Meeting-Follow-up</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>14:00 Uhr (2h)</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                        Aufgabe
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* System-Übersicht */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">System-Übersicht</h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">Backup & Wartung</p>
                      <p className="text-xs text-muted-foreground">Do, 16. Okt</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      System
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">Nutzer-Audit durchführen</p>
                      <p className="text-xs text-muted-foreground">Fr, 17. Okt</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      Hoch
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">Quartalsbericht generieren</p>
                      <p className="text-xs text-muted-foreground">Fr, 17. Okt</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Mittel
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Abteilungs-Verfügbarkeit */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Abteilungs-Verfügbarkeit</h2>
              
              <div className="space-y-4">
                {/* IT-Team */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">IT-Team</p>
                    <p className="text-sm text-muted-foreground">39/50 verfügbar</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">8</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">8</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">7</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">8</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">8</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                  </div>
                </div>

                {/* Marketing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">Marketing</p>
                    <p className="text-sm text-muted-foreground">29/35 verfügbar</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">6</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">6</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">6</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">5</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">6</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                  </div>
                </div>

                {/* Vertrieb */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">Vertrieb</p>
                    <p className="text-sm text-muted-foreground">57/75 verfügbar</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">12</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">12</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">11</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">12</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-orange-200 text-orange-900">10</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                  </div>
                </div>

                {/* HR */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">HR</p>
                    <p className="text-sm text-muted-foreground">19/25 verfügbar</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">4</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">4</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">4</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-orange-200 text-orange-900">3</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-green-200 text-green-900">4</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                    <div className="h-10 rounded flex items-center justify-center text-sm font-medium bg-muted/30 text-muted-foreground">-</div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* MONAT Tab */}
        {view === 'month' && (
          <>
            {/* Monats-Header */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Oktober 2025</h2>
                  <p className="text-sm text-muted-foreground">31 Tage</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <TrendingDown className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="h-8 px-3">
                    Dieser Monat
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Monats-KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Gesamt-<br/>Arbeitsstunden</p>
                  <Clock className="h-4 w-4 text-blue-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-blue-600">3,240 h</div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Aktive Nutzer</p>
                  <Users className="h-4 w-4 text-green-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-green-600">124</div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">System-Events</p>
                  <Activity className="h-4 w-4 text-purple-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-purple-600">1,847</div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Systemlast</p>
                  <TrendingUp className="h-4 w-4 text-orange-600 opacity-50" />
                </div>
                <div className="text-2xl font-bold text-orange-600">+8%</div>
              </Card>
            </div>

            {/* Monatskalender */}
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                  <div key={day} className="text-center text-xs text-muted-foreground font-medium">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${
                      day.isToday 
                        ? 'bg-primary text-primary-foreground border-2 border-primary' 
                        : selectedDay === day.day
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-card border hover:bg-muted'
                    }`}
                  >
                    <span className="text-sm font-medium">{day.day}</span>
                    {day.dots > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: Math.min(day.dots, 3) }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${day.isToday || selectedDay === day.day ? 'bg-primary-foreground' : 'bg-blue-600'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Tages-Details wenn Tag ausgewählt */}
            {selectedDay && (
              <Card className="p-4 border-2 border-primary">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{selectedDay}. Oktober 2025</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                    Schließen
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Sprint Review Event */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <p className="font-medium text-foreground">Sprint Review</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>09:00 Uhr</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>Online (Teams)</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-blue-600 text-blue-600">
                        Meeting
                      </Badge>
                    </div>
                  </div>

                  {/* Team Sync Event */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <p className="font-medium text-foreground">Team Sync</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>14:00 Uhr</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>Konferenzraum B</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-blue-600 text-blue-600">
                        Meeting
                      </Badge>
                    </div>
                  </div>

                  {/* Code Review Event */}
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-600"></div>
                          <p className="font-medium text-foreground">Code Review</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>16:00 Uhr</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-red-600 text-red-600">
                        Deadline
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* System-Highlights */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">System-Highlights des Monats</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">124 aktive Nutzer im System</p>
                    <p className="text-xs text-muted-foreground mt-0.5">+8 neue Nutzer diesen Monat</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">1,847 System-Events verarbeitet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Durchschnitt 59 pro Tag</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">3,240 Stunden Gesamtarbeitszeit</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Durchschnitt 26.1 h pro Nutzer</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">Systemlast um 8% gestiegen</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Peak: Donnerstag 10-12 Uhr</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Wichtige System-Events */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Wichtige System-Events</h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">System-Backup</p>
                    <p className="text-xs text-muted-foreground">15. Okt</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">Security Audit</p>
                    <p className="text-xs text-muted-foreground">20. Okt</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">Server-Wartung</p>
                    <p className="text-xs text-muted-foreground">25. Okt</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">Quartalsreport generieren</p>
                    <p className="text-xs text-muted-foreground">31. Okt</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Aktivitäts-Heatmap */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Aktivitäts-Heatmap</h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 text-xs text-muted-foreground font-medium">Mo</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-12 rounded bg-green-200"></div>
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                    <div className="flex-1 h-12 rounded bg-green-600"></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 text-xs text-muted-foreground font-medium">Di</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                    <div className="flex-1 h-12 rounded bg-gray-100"></div>
                    <div className="flex-1 h-12 rounded bg-gray-100"></div>
                    <div className="flex-1 h-12 rounded bg-green-600"></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 text-xs text-muted-foreground font-medium">Mi</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-gray-100"></div>
                    <div className="flex-1 h-12 rounded bg-green-200"></div>
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                    <div className="flex-1 h-12 rounded bg-gray-100"></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 text-xs text-muted-foreground font-medium">Do</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-gray-100"></div>
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                    <div className="flex-1 h-12 rounded bg-gray-100"></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 text-xs text-muted-foreground font-medium">Fr</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-12 rounded bg-green-200"></div>
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-green-400"></div>
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                    <div className="flex-1 h-12 rounded bg-green-500"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">Weniger</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-gray-100"></div>
                  <div className="w-4 h-4 rounded bg-green-200"></div>
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                </div>
                <span className="text-xs text-muted-foreground">Mehr</span>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
};

export default MobileTodayDashboard;
