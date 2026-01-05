import React from 'react';
import MobileBottomNav from './mobile/MobileBottomNav';
import { MobileMinuteCards } from './mobile/MobileMinuteCards';
import { SignalBars, BatteryIcon } from './mobile/HeaderIcons';
import minuteLogo from '@/assets/minute-logo.png';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export const MobileDashboard: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useUnifiedNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E4FF] via-[#EEF2FF] to-[#E8E4FF] pb-24">
      {/* Mobile Header mit blauem Gradient und MINUTE Logo */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-[#5B6EF7] via-[#4F5FE8] to-[#5B6EF7] shadow-lg">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 pt-2 text-white">
          <span className="text-xs font-medium">mobile_dashboard</span>
          <div className="flex items-center gap-2">
            <SignalBars />
            <BatteryIcon percentage={100} />
          </div>
        </div>
        
        {/* MINUTE Logo - groß und zentriert */}
        <div className="flex justify-center pb-4 pt-4">
          <img src={minuteLogo} alt="MINUTE" className="h-10" />
        </div>
      </div>

      {/* Benachrichtigungen Popover (außerhalb des Headers) */}
      <div className="fixed top-3 right-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-white hover:bg-white/20"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
            <PopoverContent className="w-[420px] max-w-[calc(100vw-2rem)] p-0 bg-background z-50" align="end">
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Benachrichtigungen</h3>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount} Neu</Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="max-h-[500px]">
                <div className="p-3">
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
                        className={`w-full p-4 rounded-lg text-left transition-colors mb-2 ${
                          notification.read
                            ? 'bg-muted/50 hover:bg-muted'
                            : 'bg-primary/10 hover:bg-primary/20 border border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-semibold text-sm text-foreground break-words">
                                {notification.title}
                              </span>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground break-words mb-2">
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

      {/* Mobile Dashboard Cards - MINUTE Design */}
      <div className="p-4">
        <MobileMinuteCards />
      </div>


      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
