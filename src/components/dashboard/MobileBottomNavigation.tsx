import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FolderKanban, 
  User, 
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      route: '/'
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: Calendar,
      route: '/calendar'
    },
    {
      id: 'projects',
      label: 'Projekte',
      icon: FolderKanban,
      route: '/projects'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      route: '/profile'
    },
    {
      id: 'more',
      label: 'Mehr',
      icon: MoreHorizontal,
      route: '/more'
    }
  ];

  const isActive = (route: string) => {
    if (route === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(route);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};