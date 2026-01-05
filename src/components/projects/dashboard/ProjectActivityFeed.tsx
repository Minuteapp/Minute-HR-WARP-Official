import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  User, 
  MessageSquare, 
  FileText, 
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ActivityItem {
  id: string;
  type: 'project_created' | 'milestone_completed' | 'comment_added' | 'file_uploaded' | 'time_logged' | 'deadline_approaching';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  projectName?: string;
  isNew?: boolean;
}

export const ProjectActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'milestone_completed',
      title: 'Meilenstein erreicht',
      description: 'Phase 1: Design Review abgeschlossen',
      user: 'Anna Schmidt',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      projectName: 'Website Redesign',
      isNew: true
    },
    {
      id: '2',
      type: 'time_logged',
      title: 'Zeit erfasst',
      description: '4.5 Stunden für Frontend Development',
      user: 'Max Müller',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      projectName: 'Mobile App'
    },
    {
      id: '3',
      type: 'comment_added',
      title: 'Kommentar hinzugefügt',
      description: 'Feedback zum neuen Dashboard Design',
      user: 'Lisa Weber',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      projectName: 'Admin Panel'
    },
    {
      id: '4',
      type: 'project_created',
      title: 'Neues Projekt erstellt',
      description: 'Customer Support Portal gestartet',
      user: 'Tom Fischer',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      projectName: 'Support Portal'
    },
    {
      id: '5',
      type: 'deadline_approaching',
      title: 'Deadline nähert sich',
      description: 'API Integration in 2 Tagen fällig',
      user: 'System',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      projectName: 'E-Commerce'
    }
  ]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconMap = {
      project_created: CheckCircle,
      milestone_completed: TrendingUp,
      comment_added: MessageSquare,
      file_uploaded: FileText,
      time_logged: Clock,
      deadline_approaching: Calendar
    };
    return iconMap[type];
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    const colorMap = {
      project_created: 'text-green-500',
      milestone_completed: 'text-blue-500',
      comment_added: 'text-purple-500',
      file_uploaded: 'text-orange-500',
      time_logged: 'text-indigo-500',
      deadline_approaching: 'text-red-500'
    };
    return colorMap[type];
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `vor ${minutes}m`;
    if (hours < 24) return `vor ${hours}h`;
    return `vor ${days}d`;
  };

  // Simuliere neue Aktivitäten
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'time_logged',
        title: 'Zeit erfasst',
        description: `${Math.floor(Math.random() * 8) + 1} Stunden für Development`,
        user: 'Live User',
        timestamp: new Date(),
        projectName: 'Live Project',
        isNew: true
      };

      setActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 4)];
        // Entferne isNew Flag nach 3 Sekunden
        setTimeout(() => {
          setActivities(current => 
            current.map(item => 
              item.id === newActivity.id ? { ...item, isNew: false } : item
            )
          );
        }, 3000);
        return updated;
      });
    }, 10000); // Neue Aktivität alle 10 Sekunden

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${
                activity.isNew ? 'bg-primary/5 border-primary/20' : 'bg-background'
              }`}
            >
              <div className={`p-2 rounded-full bg-background border ${iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  {activity.isNew && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        <Zap className="h-3 w-3 mr-1" />
                        Neu
                      </Badge>
                    </motion.div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user}
                    </span>
                    {activity.projectName && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-primary">{activity.projectName}</span>
                      </>
                    )}
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};