import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, MoreHorizontal, ShieldCheck, User } from "lucide-react";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  entity: string;
  status: "new" | "investigating" | "resolved" | "dismissed";
}

interface AlertListProps {
  alerts: Alert[];
  className?: string;
  title?: string;
  description?: string;
  limit?: number;
  onViewAll?: () => void;
}

const AlertList = ({ 
  alerts, 
  className, 
  title = "Recent Alerts", 
  description = "Latest security anomalies detected in your environment", 
  limit = 5,
  onViewAll 
}: AlertListProps) => {
  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "low":
        return "bg-anomaly-low/10 text-anomaly-low border-anomaly-low/40";
      case "medium":
        return "bg-anomaly-medium/10 text-anomaly-medium border-anomaly-medium/40";
      case "high":
        return "bg-anomaly-high/10 text-anomaly-high border-anomaly-high/40";
      case "critical":
        return "bg-red-600/10 text-red-500 border-red-600/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/40";
      case "investigating":
        return "bg-amber-500/10 text-amber-400 border-amber-500/40";
      case "resolved":
        return "bg-green-500/10 text-green-400 border-green-500/40";
      case "dismissed":
        return "bg-gray-500/10 text-gray-400 border-gray-500/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {alerts.slice(0, limit).map((alert) => (
            <div 
              key={alert.id}
              className="flex items-start gap-4 px-6 py-3 hover:bg-secondary/50 transition-colors"
            >
              <div className={cn(
                "p-2 rounded-full",
                alert.severity === "high" ? "bg-anomaly-high/10" : 
                alert.severity === "medium" ? "bg-anomaly-medium/10" : 
                "bg-anomaly-low/10"
              )}>
                {alert.severity === "high" ? (
                  <AlertTriangle className="h-5 w-5 text-anomaly-high" />
                ) : alert.severity === "medium" ? (
                  <AlertTriangle className="h-5 w-5 text-anomaly-medium" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-anomaly-low" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(alert.status)}>
                    {alert.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{alert.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>{alert.timestamp}</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{alert.entity}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertList;
