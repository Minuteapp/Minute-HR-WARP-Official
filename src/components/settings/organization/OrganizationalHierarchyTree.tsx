import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  MapPin,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  UserPlus,
  Plus
} from 'lucide-react';
import type { 
  OrganizationalHierarchy, 
  OrganizationalUnit, 
  OrganizationalUnitType 
} from '@/types/organizational-structure';

interface OrganizationalHierarchyTreeProps {
  hierarchy: OrganizationalHierarchy[];
  onEditUnit: (unit: OrganizationalUnit) => void;
  onDeleteUnit: (unit: OrganizationalUnit) => void;
  onCreateRole: (unit: OrganizationalUnit) => void;
}

const getTypeIcon = (type: OrganizationalUnitType) => {
  switch (type) {
    case 'area':
      return <Building2 className="h-4 w-4" />;
    case 'department':
      return <Briefcase className="h-4 w-4" />;
    case 'team':
      return <Users className="h-4 w-4" />;
    case 'location':
      return <MapPin className="h-4 w-4" />;
    case 'subsidiary':
      return <Building2 className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: OrganizationalUnitType) => {
  switch (type) {
    case 'area':
      return 'Bereich';
    case 'department':
      return 'Abteilung';
    case 'team':
      return 'Team';
    case 'location':
      return 'Standort';
    case 'subsidiary':
      return 'Tochterunternehmen';
    default:
      return type;
  }
};

const HierarchyNode: React.FC<{
  node: OrganizationalHierarchy;
  onEditUnit: (unit: OrganizationalUnit) => void;
  onDeleteUnit: (unit: OrganizationalUnit) => void;
  onCreateRole: (unit: OrganizationalUnit) => void;
}> = ({ node, onEditUnit, onDeleteUnit, onCreateRole }) => {
  const [isExpanded, setIsExpanded] = useState(node.isExpanded || false);

  const handleToggle = () => {
    if (node.hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
          node.depth === 0 ? 'bg-muted/30' : ''
        }`}
        style={{ marginLeft: `${node.depth * 24}px` }}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleToggle}
          disabled={!node.hasChildren}
        >
          {node.hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>

        {/* Unit Icon */}
        <div className="p-1.5 rounded bg-background border">
          {getTypeIcon(node.unit.type)}
        </div>

        {/* Unit Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{node.unit.name}</h4>
            {node.unit.code && (
              <Badge variant="outline" className="text-xs">
                {node.unit.code}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {getTypeLabel(node.unit.type)}
            </Badge>
            {!node.unit.is_active && (
              <Badge variant="destructive" className="text-xs">
                Inaktiv
              </Badge>
            )}
          </div>
          {node.unit.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {node.unit.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {node.unit.cost_center && (
              <span>Kostenstelle: {node.unit.cost_center}</span>
            )}
            {node.unit.manager_id && (
              <span>Manager zugewiesen</span>
            )}
            {node.hasChildren && (
              <span>{node.children.length} Untereinheit(en)</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onCreateRole(node.unit)}
            title="Rolle zuweisen"
          >
            <UserPlus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEditUnit(node.unit)}
            title="Bearbeiten"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDeleteUnit(node.unit)}
            disabled={!node.unit.is_active}
            title="Deaktivieren"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <HierarchyNode
              key={child.unit.id}
              node={child}
              onEditUnit={onEditUnit}
              onDeleteUnit={onDeleteUnit}
              onCreateRole={onCreateRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrganizationalHierarchyTree: React.FC<OrganizationalHierarchyTreeProps> = ({
  hierarchy,
  onEditUnit,
  onDeleteUnit,
  onCreateRole
}) => {
  if (hierarchy.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Noch keine Organisationsstruktur vorhanden.</p>
        <p className="text-sm">Erstellen Sie eine neue Organisationseinheit, um zu beginnen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hierarchy.map((node) => (
        <HierarchyNode
          key={node.unit.id}
          node={node}
          onEditUnit={onEditUnit}
          onDeleteUnit={onDeleteUnit}
          onCreateRole={onCreateRole}
        />
      ))}
    </div>
  );
};