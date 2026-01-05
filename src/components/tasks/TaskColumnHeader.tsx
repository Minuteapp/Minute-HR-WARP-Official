
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TaskColumnHeaderProps {
  title: string;
  count: number;
  color?: string;
}

export const TaskColumnHeader: React.FC<TaskColumnHeaderProps> = ({
  title,
  count,
  color = 'gray'
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'purple':
        return 'bg-purple-50 border-purple-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 border-b ${getColorClasses(color)}`}>
      <h3 className="font-medium text-sm text-gray-700">{title}</h3>
      <Badge 
        variant="secondary" 
        className="bg-white text-gray-600 border border-gray-300"
      >
        {count}
      </Badge>
    </div>
  );
};
