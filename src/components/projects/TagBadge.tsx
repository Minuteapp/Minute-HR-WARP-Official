
import React from 'react';
import { Badge } from "@/components/ui/badge";

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagBadgeProps {
  tag: Tag;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  const getTagStyle = () => {
    if (!tag.color) return {};
    
    return {
      backgroundColor: `${tag.color}20`, // 20% Opazität
      color: tag.color,
      borderColor: `${tag.color}40` // 40% Opazität
    };
  };

  return (
    <Badge 
      variant="outline" 
      style={getTagStyle()}
      className="px-2 py-0.5 text-xs font-medium rounded-md"
    >
      {tag.name}
    </Badge>
  );
};
