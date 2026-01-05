import React from 'react';
import { Home, Calendar, ListTodo, MoreHorizontal, User, Settings, ArrowLeft, LayoutDashboard, FolderKanban, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';

const MobileMehrPage = () => {
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
        <div className="p-4 flex items-center justify-center" style={{ backgroundColor: '#5B6EF7' }}>
          <div className="px-8 py-2 text-xl font-bold" style={{ backgroundColor: 'white', color: '#5B6EF7' }}>
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
        className="p-4 flex items-center justify-center"
        style={{ backgroundColor: '#5B6EF7' }}
      >
        <div 
          className="px-8 py-2 text-xl font-bold"
          style={{ backgroundColor: 'white', color: '#5B6EF7' }}
        >
          MINUTE
        </div>
      </div>

      {/* Hauptinhalt mit Modulen */}
      <div 
        className="flex-1 p-4 overflow-y-auto"
        style={{ backgroundColor: '#E8E9F3' }}
      >
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          {/* Gefüllte Module - nur sichtbare */}
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.id}
                className="bg-white rounded-3xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                style={{ 
                  borderColor: '#5B6EF7',
                  backgroundColor: module.color
                }}
                onClick={() => handleModuleClick(module)}
              >
                <div className="flex flex-col items-center text-center h-20 justify-center">
                  <IconComponent className="w-8 h-8 text-white mb-2" />
                  <span className="text-sm font-medium text-white">{module.title}</span>
                </div>
              </div>
            );
          })}

          {/* Leere Module - nur Platzhalter wenn nötig */}
          {modules.length < 8 && Array.from({ length: Math.max(0, 8 - modules.length) }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white rounded-3xl p-4 shadow-sm border"
              style={{ borderColor: '#5B6EF7' }}
            >
              <div className="h-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Untere Navbar - Blaue Navigation */}
      <div 
        className="p-4"
        style={{ backgroundColor: '#5B6EF7' }}
      >
        <div className="flex justify-around items-center max-w-sm mx-auto">
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/')}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Startseite</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/calendar')}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Kalender</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/tasks')}
          >
            <ListTodo size={24} />
            <span className="text-xs mt-1">Aufgaben</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <MoreHorizontal size={24} />
            <span className="text-xs mt-1">Mehr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMehrPage;