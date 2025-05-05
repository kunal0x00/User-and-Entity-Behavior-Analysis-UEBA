
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "anomaly" | "outline";
  className?: string;
}

const cardVariants = cva(
  "rounded-lg p-5 transition-all relative overflow-hidden flex flex-col cyber-border",
  {
    variants: {
      variant: {
        default: "bg-card/80 backdrop-blur-sm",
        anomaly: "bg-secondary/80 backdrop-blur-sm border-primary/30",
        outline: "border border-border bg-secondary/20 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendLabel,
  variant = "default",
  className,
}: StatCardProps) => {
  return (
    <div className={cn(cardVariants({ variant }), className, "group scanning-effect ")}>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-primary bg-primary/10 p-1.5 rounded-md">{icon}</div>
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{value}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 text-xs mt-2 relative z-10", 
          trend > 0 ? "text-anomaly-high" : trend < 0 ? "text-anomaly-low" : "text-muted-foreground"
        )}>
          {trend > 0 ? "↑" : trend < 0 ? "↓" : "–"}
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
        </div>
      )}
      
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default StatCard;
