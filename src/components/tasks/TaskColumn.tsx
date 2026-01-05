
import React from 'react';

interface TaskColumnProps {
  children: React.ReactNode;
  id?: string; // Adding optional id prop
}

export const TaskColumn = ({ children }: TaskColumnProps) => {
  return (
    <div className="flex-1 p-2 overflow-y-auto">
      {children}
    </div>
  );
};
