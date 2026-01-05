
import React, { ReactNode } from 'react';

interface DashboardContainerProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  onHeaderClick?: () => void;
  onClick?: () => void;
  className?: string;
}

const DashboardContainer = ({ 
  icon, 
  title, 
  children, 
  onHeaderClick,
  onClick,
  className = ""
}: DashboardContainerProps) => {
  const handleContainerClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (onHeaderClick) {
      e.stopPropagation();
      onHeaderClick();
    }
  };

  return (
    <div 
      className={`p-4 h-full ${className} ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors duration-200' : ''}`}
      onClick={handleContainerClick}
    >
      <div 
        className={`flex items-center gap-2 mb-4 ${onHeaderClick ? 'cursor-pointer hover:text-primary transition-colors duration-200' : ''}`}
        onClick={handleHeaderClick}
      >
        <div className="text-primary">{icon}</div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardContainer;
