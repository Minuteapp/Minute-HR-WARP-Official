import { motion } from 'framer-motion';
import { Project } from '@/types/project.types';

interface ProjectProgressRingProps {
  projects: Project[];
}

export const ProjectProgressRing = ({ projects }: ProjectProgressRingProps) => {
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingProjects = projects.filter(p => p.status === 'pending').length;
  
  const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
  const activeRate = totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0;
  const pendingRate = totalProjects > 0 ? (pendingProjects / totalProjects) * 100 : 0;

  const circumference = 2 * Math.PI * 45; // Radius von 45

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* SVG Ring */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/20"
          />
          
          {/* Completed Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10B981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (completionRate / 100) * circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (completionRate / 100) * circumference }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Active Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.85}
            strokeDashoffset={circumference * 0.85 - (activeRate / 100) * circumference * 0.85}
            initial={{ strokeDashoffset: circumference * 0.85 }}
            animate={{ strokeDashoffset: circumference * 0.85 - (activeRate / 100) * circumference * 0.85 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
          
          {/* Pending Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="31"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.7}
            strokeDashoffset={circumference * 0.7 - (pendingRate / 100) * circumference * 0.7}
            initial={{ strokeDashoffset: circumference * 0.7 }}
            animate={{ strokeDashoffset: circumference * 0.7 - (pendingRate / 100) * circumference * 0.7 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-2xl font-bold text-primary"
            >
              {totalProjects}
            </motion.div>
            <div className="text-xs text-muted-foreground">Projekte</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="ml-8 space-y-3">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm">Abgeschlossen ({completedProjects})</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm">Aktiv ({activeProjects})</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-sm">Wartend ({pendingProjects})</span>
        </motion.div>
      </div>
    </div>
  );
};