
import { Search, Bell, Plus, UserCircle, Settings, LayoutDashboard, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTenant } from '@/contexts/TenantContext';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import VoiceButton from '@/components/voice/VoiceButton';
import { useRolePreview } from '@/hooks/useRolePreview';
import { useQuery } from '@tanstack/react-query';

const Header = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { notifications, getUnreadCount, markAsRead } = useNotifications();
  const { tenantCompany, isSuperAdmin } = useTenant();
  const { isPreviewActive, previewRole, getRoleLabel } = useRolePreview();
  const unreadCount = getUnreadCount();

  // Prüfe ob der Benutzer ein SuperAdmin ist (für "Zurück zu Admin" Button)
  const { data: isSuperAdminUser } = useQuery({
    queryKey: ['is-superadmin-header', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'superadmin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id
  });

  // Zurück zu Admin Button nur für SuperAdmins im Tenant-Modus
  const showBackToAdminButton = isSuperAdminUser && tenantCompany;

  const handleBackToSuperAdmin = () => {
    // Force complete page reload to clear all tenant state
    window.location.href = `${window.location.protocol}//${window.location.host}/admin`;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        // Suche direkt hier durchführen statt zu einer anderen Seite zu navigieren
        console.log('Suche wird durchgeführt für:', searchQuery);
        
        // Einfache Suche in verfügbaren Bereichen
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, description')
          .ilike('name', `%${searchQuery}%`)
          .limit(5);

        const { data: events, error: eventsError } = await supabase
          .from('calendar_events')
          .select('id, title, description')
          .ilike('title', `%${searchQuery}%`)
          .limit(5);

        if (projectsError || eventsError) {
          console.error('Suchfehler:', projectsError || eventsError);
          toast.error('Bei der Suche ist ein Fehler aufgetreten');
          return;
        }

        const allResults = [
          ...(projects || []).map(p => ({ ...p, type: 'project' })),
          ...(events || []).map(e => ({ ...e, type: 'event' }))
        ];

        if (allResults.length > 0) {
          toast.success(`${allResults.length} Ergebnis(se) für "${searchQuery}" gefunden`);
          console.log('Suchergebnisse:', allResults);
        } else {
          toast.info(`Keine Ergebnisse für "${searchQuery}" gefunden`);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Bei der Suche ist ein Fehler aufgetreten');
      }
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </form>
        </div>
        
        <div className="flex items-center space-x-4 ml-4">
          {/* ZURÜCK ZU ADMIN BUTTON - nur für SuperAdmins im Tenant-Modus */}
          {showBackToAdminButton && (
            <Button
              onClick={handleBackToSuperAdmin}
              variant="outline"
              className="flex items-center px-4 py-2 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <Shield className="w-4 h-4 mr-2" />
              Zurück zu Admin
            </Button>
          )}

          <VoiceButton />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus size={20} className="mr-2" />
                <span>Neu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard öffnen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/employees/new')}>
                <UserCircle className="mr-2 h-4 w-4" />
                Neuer Mitarbeiter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/projects/new')}>
                <Settings className="mr-2 h-4 w-4" />
                Neues Projekt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/calendar/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Neuer Termin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/tasks/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Aufgabe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center px-4 py-2 rounded-lg">
                <UserCircle size={20} className="mr-2" />
                <span>Profil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Mein Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Meine Einstellungen
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <ScrollArea className="h-[400px]">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Benachrichtigungen</h3>
                    {unreadCount > 0 && (
                      <Badge variant="destructive">{unreadCount} Neu</Badge>
                    )}
                  </div>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-500">Keine Benachrichtigungen</p>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-gray-600 text-sm">{notification.message}</p>
                              <p className="text-gray-400 text-xs mt-1">
                                {format(new Date(notification.timestamp), 'dd.MM.yyyy HH:mm')}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Als gelesen markieren
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
    </div>
  );
};

export default Header;
