
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationItem as NavItem } from './NavigationConfig';

interface NavigationItemProps {
  item: NavItem;
  isCollapsed: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ item, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  
  if (!item.icon) {
    return null;
  }
  
  const Icon = item.icon;
  
  return (
    <Link
      to={item.path}
      className={`flex items-center p-2 mb-1 rounded-lg text-gray-700 hover:text-primary transition-colors group ${
        isActive ? 'bg-primary/10 text-primary' : ''
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      {!isCollapsed && <span className="ml-2 text-sm">{item.label}</span>}
    </Link>
  );
};
