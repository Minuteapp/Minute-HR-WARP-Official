
import { Home, Calendar, ListTodo, Menu, Clock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import TimeTrackingDialog from '@/components/dialogs/TimeTrackingDialog';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRolePermissions();
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  // Bestimme, ob der Benutzer ein Manager ist (Vorgesetzter)
  const isManager = user?.user_metadata?.role === 'manager' || 
                   user?.user_metadata?.isManager === true;
  
  // Bestimme, ob ein Menüitem aktiv ist
  const isActive = (path: string) => location.pathname === path;

  const handleButtonPress = (buttonId: string, action: () => void) => {
    setPressedButton(buttonId);
    setTimeout(() => {
      setPressedButton(null);
      action();
    }, 150);
  };

  const handleTimeAction = () => {
    setShowTimeDialog(true);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2c3ad1] border-t border-[#2c3ad1]/20 z-50">
        <div className="flex justify-around items-center h-16 px-2 relative">
          {/* Home Button */}
          <button 
            onClick={() => handleButtonPress('home', () => navigate('/'))}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all duration-150 rounded-lg ${
              pressedButton === 'home' ? 'scale-95 bg-white/20' : ''
            } ${isActive('/') ? 'text-white' : 'text-white/70'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </button>
          
          {/* Zweiter Navigationsbutton basierend auf Rolle */}
          {isAdmin ? (
            <button 
              onClick={() => handleButtonPress('team', () => navigate('/employees'))}
              className={`flex flex-col items-center justify-center w-16 h-12 transition-all duration-150 rounded-lg ${
                pressedButton === 'team' ? 'scale-95 bg-white/20' : ''
              } ${isActive('/employees') ? 'text-white' : 'text-white/70'}`}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">Team</span>
            </button>
          ) : (
            <button 
              onClick={() => handleButtonPress('calendar', () => navigate('/calendar'))}
              className={`flex flex-col items-center justify-center w-16 h-12 transition-all duration-150 rounded-lg ${
                pressedButton === 'calendar' ? 'scale-95 bg-white/20' : ''
              } ${isActive('/calendar') ? 'text-white' : 'text-white/70'}`}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">Kalender</span>
            </button>
          )}
          
          {/* Zentrale Zeit-Schaltfläche */}
          <button 
            onClick={() => handleButtonPress('time', handleTimeAction)}
            className={`flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg transition-all duration-150 -mt-6 ${
              pressedButton === 'time' ? 'scale-90 bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <Clock className="h-7 w-7 text-[#2c3ad1]" />
          </button>
          
          {/* Aufgaben-Navigation für alle Rollen */}
          <button 
            onClick={() => handleButtonPress('tasks', () => navigate('/tasks'))}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all duration-150 rounded-lg ${
              pressedButton === 'tasks' ? 'scale-95 bg-white/20' : ''
            } ${isActive('/tasks') ? 'text-white' : 'text-white/70'}`}
          >
            <ListTodo className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">Aufgaben</span>
          </button>
          
          {/* "Mehr"-Menü für alle Benutzer */}
          <button 
            onClick={() => handleButtonPress('menu', () => navigate('/mehr'))}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all duration-150 rounded-lg ${
              pressedButton === 'menu' ? 'scale-95 bg-white/20' : ''
            } ${isActive('/mehr') ? 'text-white' : 'text-white/70'}`}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">Mehr</span>
          </button>
        </div>
      </nav>

      {/* Time Tracking Dialog */}
      <TimeTrackingDialog
        open={showTimeDialog}
        onOpenChange={setShowTimeDialog}
        mode="start"
        onSuccess={() => {
          setShowTimeDialog(false);
        }}
      />
    </>
  );
};

export default MobileNavigation;
