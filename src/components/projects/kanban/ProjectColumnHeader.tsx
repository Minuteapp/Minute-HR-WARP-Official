
import { ReactNode } from 'react';

interface ProjectColumnHeaderProps {
  title: string;
  count: number;
  color: string;
  icon: ReactNode;
}

export const ProjectColumnHeader = ({ title, count, icon, color }: ProjectColumnHeaderProps) => {
  return (
    <div className={`flex items-center justify-between p-2 ${color}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <span className="text-xs bg-white bg-opacity-80 rounded px-2 py-0.5">
        {count}
      </span>
    </div>
  );
};
