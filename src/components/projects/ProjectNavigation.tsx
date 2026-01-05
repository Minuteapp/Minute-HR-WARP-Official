
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Archive, Grid, Layout, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectView {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  sort_order: number;
  filter_config: Record<string, any>;
}

const iconMap: Record<string, React.ComponentType> = {
  Layout,
  Play,
  Archive,
  Grid,
};

export const ProjectNavigation = () => {
  const location = useLocation();
  
  const { data: views = [] } = useQuery({
    queryKey: ['project-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_views')
        .select('*')
        .order('sort_order');
        
      if (error) throw error;
      return data as ProjectView[];
    }
  });

  return (
    <nav className="space-y-1">
      {views.map((view) => {
        const Icon = iconMap[view.icon] || Layout;
        const isActive = location.pathname === `/projects/${view.slug}`;
        
        return (
          <Link key={view.id} to={`/projects/${view.slug}`}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {view.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};
