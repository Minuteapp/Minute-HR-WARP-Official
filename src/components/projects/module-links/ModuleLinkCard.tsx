
import { X, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleIcon } from "./ModuleIcon";
import { getLinkTypeLabel, getLinkTypeColor } from "./utils";
import type { ModuleLink } from "@/types/project.types";

interface ModuleLinkCardProps {
  link: ModuleLink;
  onDelete: (id: string) => void;
}

export function ModuleLinkCard({ link, onDelete }: ModuleLinkCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ModuleIcon type={link.module_type} />
          <div>
            <div className="text-sm text-gray-500">
              Referenz-ID
            </div>
            <div className="font-medium">
              {link.reference_id}
            </div>
          </div>
          <Badge className={`ml-4 ${getLinkTypeColor(link.metadata?.link_type)}`}>
            {getLinkTypeLabel(link.metadata?.link_type)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(link.id)}
            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
