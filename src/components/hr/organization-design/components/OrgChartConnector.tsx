import { cn } from "@/lib/utils";

interface OrgChartConnectorProps {
  type: "vertical" | "horizontal" | "corner-left" | "corner-right" | "t-junction";
  className?: string;
}

export const OrgChartConnector = ({ type, className }: OrgChartConnectorProps) => {
  const baseStyle = "bg-blue-500";
  
  switch (type) {
    case "vertical":
      return (
        <div className={cn("w-0.5 h-8", baseStyle, className)} />
      );
    case "horizontal":
      return (
        <div className={cn("h-0.5 flex-1", baseStyle, className)} />
      );
    case "corner-left":
      return (
        <div className={cn("relative w-8 h-8", className)}>
          <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2", baseStyle)} />
          <div className={cn("absolute top-1/2 -translate-y-1/2 left-0 w-1/2 h-0.5", baseStyle)} />
        </div>
      );
    case "corner-right":
      return (
        <div className={cn("relative w-8 h-8", className)}>
          <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2", baseStyle)} />
          <div className={cn("absolute top-1/2 -translate-y-1/2 right-0 w-1/2 h-0.5", baseStyle)} />
        </div>
      );
    case "t-junction":
      return (
        <div className={cn("relative w-full h-8", className)}>
          <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2", baseStyle)} />
          <div className={cn("absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5", baseStyle)} />
        </div>
      );
    default:
      return null;
  }
};

// Vertikale Linie von Eltern zu Kind
export const VerticalLine = ({ height = 32 }: { height?: number }) => (
  <div 
    className="w-0.5 bg-blue-500 mx-auto" 
    style={{ height: `${height}px` }} 
  />
);

// Horizontale Sammelleiste für mehrere Kinder
export const HorizontalBranch = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex items-start justify-center">
    {/* Horizontale Linie */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-blue-500" 
         style={{ width: 'calc(100% - 100px)' }} />
    {/* Kinder mit vertikalen Verbindungen */}
    <div className="flex items-start gap-6 pt-8">
      {children}
    </div>
  </div>
);

// Wrapper für ein Kind mit vertikaler Verbindungslinie
export const ChildBranch = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col items-center">
    <div className="w-0.5 h-8 bg-blue-500" />
    {children}
  </div>
);
