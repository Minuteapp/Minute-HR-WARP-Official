import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  Target, 
  FileText, 
  Users, 
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const QuickProjectActions = () => {
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'new-project',
      title: 'Neues Projekt',
      description: 'Projekt erstellen',
      icon: Plus,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => navigate('/projects/list')
    },
    {
      id: 'time-tracking',
      title: 'Zeit erfassen',
      description: 'Arbeitszeit buchen',
      icon: Clock,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => toast.info('Zeiterfassung wird geöffnet...')
    },
    {
      id: 'milestones',
      title: 'Meilensteine',
      description: 'Fortschritt verwalten',
      icon: Target,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: () => toast.info('Meilenstein-Verwaltung wird geöffnet...')
    },
    {
      id: 'reports',
      title: 'Berichte',
      description: 'Analytics ansehen',
      icon: FileText,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      action: () => toast.info('Berichterstattung wird geöffnet...')
    },
    {
      id: 'team',
      title: 'Team-Status',
      description: 'Auslastung prüfen',
      icon: Users,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      action: () => toast.info('Team-Dashboard wird geöffnet...')
    },
    {
      id: 'calendar',
      title: 'Kalender',
      description: 'Termine verwalten',
      icon: Calendar,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      action: () => navigate('/calendar')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className={`w-full h-auto p-4 flex flex-col items-center gap-2 border-2 hover:border-primary/50 transition-all group ${
                activeAction === action.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => {
                setActiveAction(action.id);
                setTimeout(() => {
                  action.action();
                  setActiveAction(null);
                }, 200);
              }}
            >
              <div className={`p-2 rounded-lg ${action.color} ${action.hoverColor} transition-colors group-hover:scale-110`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
              {activeAction === action.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                />
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};