import React from 'react';
import { User, Settings, LayoutDashboard, FolderKanban, Users, Calendar, ListTodo, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';

const DesktopMehrPage = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#5B6EF7' }}>
          Alle Module
        </h1>
        
        <div className="grid grid-cols-6 gap-6">
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
                <div className="flex flex-col items-center text-center h-32 justify-center">
                  <IconComponent className="w-12 h-12 text-white mb-4" />
                  <span className="text-lg font-medium text-white">{module.title}</span>
                </div>
              </div>
            );
          })}

          {/* Leere Module - nur Platzhalter wenn nötig */}
          {modules.length < 18 && Array.from({ length: Math.max(0, 18 - modules.length) }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white rounded-3xl p-6 shadow-sm border"
              style={{ borderColor: '#5B6EF7' }}
            >
              <div className="h-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopMehrPage;