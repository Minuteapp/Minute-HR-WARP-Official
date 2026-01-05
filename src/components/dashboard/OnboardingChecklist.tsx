import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboardingChecklist, ChecklistItem } from '@/hooks/useOnboardingChecklist';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  X, 
  Building2, 
  Network, 
  Users, 
  CalendarOff, 
  UserPlus,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  'building-2': Building2,
  'network': Network,
  'users': Users,
  'calendar-off': CalendarOff,
  'user-plus': UserPlus,
};

interface OnboardingChecklistProps {
  className?: string;
}

export const OnboardingChecklist = ({ className }: OnboardingChecklistProps) => {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    isDismissed,
    completionPercentage,
    allCompleted,
    dismissChecklist,
  } = useOnboardingChecklist();

  // Don't show if dismissed or all completed
  if (isDismissed || allCompleted || isLoading) {
    if (isLoading) {
      return (
        <Card className={className}>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const handleItemClick = (item: ChecklistItem) => {
    navigate(item.link);
  };

  return (
    <Card className={cn("relative", className)}>
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={dismissChecklist}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Erste Schritte</CardTitle>
        </div>
        <CardDescription>
          Richten Sie Ihre Firma vollständig ein
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Circle;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  item.isCompleted 
                    ? "bg-green-50 hover:bg-green-100" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {/* Status Icon */}
                {item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}

                {/* Item Icon */}
                <IconComponent className={cn(
                  "h-5 w-5 flex-shrink-0",
                  item.isCompleted ? "text-green-600" : "text-muted-foreground"
                )} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    item.isCompleted && "line-through text-muted-foreground"
                  )}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.isCompleted 
                      ? `${item.count} vorhanden` 
                      : item.description
                    }
                  </p>
                </div>

                {/* Arrow */}
                {!item.isCompleted && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Setup Wizard Link */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/company-setup')}
        >
          Zum Setup-Wizard
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
