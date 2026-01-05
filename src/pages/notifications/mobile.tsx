import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Search, Filter, Star, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import NotificationRequests from "@/components/notifications/NotificationRequests";
import NotificationSettings from "@/components/notifications/NotificationSettings";
import { MobileBottomNavigation } from '@/components/dashboard/MobileBottomNavigation';
import minuteLogo from '@/assets/minute-logo-4.png';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function MobileNotificationsPage() {
  const [unreadCount] = useState(18);
  const { notifications, unreadCount: liveUnreadCount, markAsRead } = useUnifiedNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E4FF] via-[#EEF2FF] to-[#E8E4FF] pb-24">
      {/* Mobile Header mit MINUTE Logo und Label */}
      <div className="sticky top-0 z-40 bg-[#2C3AD1] shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-white/60 text-[10px] font-medium">benachrichtigungen</span>
          <img src={minuteLogo} alt="MINUTE" className="h-8" />
          
          {/* Benachrichtigungen */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {liveUnreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {liveUnreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-2" align="end">
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Benachrichtigungen</h3>
                  {liveUnreadCount > 0 && (
                    <Badge variant="destructive">{liveUnreadCount} Neu</Badge>
                  )}
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
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: de
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

      {/* Content */}
      <div className="px-4 py-6">
        <Tabs defaultValue="center" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur border w-full justify-start rounded-lg h-auto p-1 space-x-2 mb-6">
            <TabsTrigger 
              value="center"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
            >
              Zentrale
            </TabsTrigger>
            <TabsTrigger 
              value="requests"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
            >
              Anfragen
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2"
            >
              Einstellungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="center" className="mt-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <NotificationRequests />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
}
