import React from 'react';
import { Home, Calendar, ListTodo, MoreHorizontal, User, Settings, LayoutDashboard, FolderKanban, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';

const TabletMehrPage = () => {
  const navigate = useNavigate();
  const { isModuleVisible, loading } = useSidebarPermissions();

  const allModules = [
    {
      id: 'profil',
      title: 'Profil',
      icon: User,
      path: '/profile',
      color: '#5B6EF7'
    },
    {
      id: 'einstellungen',
      title: 'Einstellungen',
      icon: Settings,
      path: '/settings',
      color: '#5B6EF7'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      color: '#5B6EF7'
    },
    {
      id: 'projekte',
      title: 'Projekte',
      icon: FolderKanban,
      path: '/projects',
      color: '#5B6EF7'
    },
    {
      id: 'mitarbeiter',
      title: 'Mitarbeiter',
      icon: Users,
      path: '/employees',
      color: '#5B6EF7'
    },
    {
      id: 'kalender',
      title: 'Kalender',
      icon: Calendar,
      path: '/calendar',
      color: '#5B6EF7'
    },
    {
      id: 'aufgaben',
      title: 'Aufgaben',
      icon: ListTodo,
      path: '/tasks',
      color: '#5B6EF7'
    },
    {
      id: 'berichte',
      title: 'Berichte',
      icon: FileText,
      path: '/reports',
      color: '#5B6EF7'
    }
  ];

  // Filter modules based on permission matrix
  const modules = allModules.filter(module => isModuleVisible(module.path));

  const handleModuleClick = (module: any) => {
    navigate(module.path);
  };

  const handleNavigationClick = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="p-6 flex items-center justify-center" style={{ backgroundColor: '#5B6EF7' }}>
          <div className="px-12 py-3 text-2xl font-bold" style={{ backgroundColor: 'white', color: '#5B6EF7' }}>
            MINUTE
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#E8E9F3' }}>
          <div className="text-gray-500">Lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Obere Navbar - Blaues Header mit MINUTE Logo */}
      <div 
        className="p-6 flex items-center justify-center"
        style={{ backgroundColor: '#5B6EF7' }}
      >
        <div 
          className="px-12 py-3 text-2xl font-bold"
          style={{ backgroundColor: 'white', color: '#5B6EF7' }}
        >
          MINUTE
        </div>
      </div>

      {/* Hauptinhalt mit Modulen */}
      <div 
        className="flex-1 p-6 overflow-y-auto"
        style={{ backgroundColor: '#E8E9F3' }}
      >
        <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
          {/* Gefüllte Module - nur sichtbare */}
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.id}
                className="bg-white rounded-3xl p-6 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                style={{ 
                  borderColor: '#5B6EF7',
                  backgroundColor: module.color
                }}
                onClick={() => handleModuleClick(module)}
              >
                <div className="flex flex-col items-center text-center h-24 justify-center">
                  <IconComponent className="w-10 h-10 text-white mb-3" />
                  <span className="text-base font-medium text-white">{module.title}</span>
                </div>
              </div>
            );
          })}

          {/* Leere Module - nur Platzhalter wenn nötig */}
          {modules.length < 12 && Array.from({ length: Math.max(0, 12 - modules.length) }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white rounded-3xl p-6 shadow-sm border"
              style={{ borderColor: '#5B6EF7' }}
            >
              <div className="h-24"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Untere Navbar - Blaue Navigation */}
      <div 
        className="p-6"
        style={{ backgroundColor: '#5B6EF7' }}
      >
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/')}
          >
            <Home size={28} />
            <span className="text-sm mt-2">Startseite</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/calendar')}
          >
            <Calendar size={28} />
            <span className="text-sm mt-2">Kalender</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/tasks')}
          >
            <ListTodo size={28} />
            <span className="text-sm mt-2">Aufgaben</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <MoreHorizontal size={28} />
            <span className="text-sm mt-2">Mehr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletMehrPage;