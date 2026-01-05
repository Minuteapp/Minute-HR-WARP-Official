import { Home, Calendar, CheckSquare, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Startseite', path: '/' },
    { icon: Calendar, label: 'Kalender', path: '/calendar' },
    { icon: CheckSquare, label: 'Aufgaben', path: '/tasks' },
    { icon: LayoutGrid, label: 'Mehr', path: '/mehr' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2c3ad1] shadow-lg md:hidden z-50">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
                active ? 'text-white' : 'text-white/60'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
