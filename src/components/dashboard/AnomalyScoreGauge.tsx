
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AnomalyScoreGaugeProps {
  value: number;
  title: string;
  description?: string;
  className?: string;
}

const AnomalyScoreGauge = ({ value, title, description, className }: AnomalyScoreGaugeProps) => {
  // Normalize value to 0-1 range
  const normalizedValue = Math.min(Math.max(value, 0), 1);
  
  // Calculate rotation angle (0 to 180 degrees)
  const angle = normalizedValue * 180;
  
  // Determine color based on value
  const getColor = () => {
    if (normalizedValue < 0.3) return 'text-anomaly-low';
    if (normalizedValue < 0.7) return 'text-anomaly-medium';
    return 'text-anomaly-high';
  };
  
  // Get risk level text
  const getRiskLevel = () => {
    if (normalizedValue < 0.3) return 'Low Risk';
    if (normalizedValue < 0.7) return 'Medium Risk';
    return 'High Risk';
  };

  // Get icon based on risk level
  const getIcon = () => {
    if (normalizedValue < 0.3) return <ShieldCheck className="w-6 h-6 text-anomaly-low" />;
    if (normalizedValue < 0.7) return <Shield className="w-6 h-6 text-anomaly-medium" />;
    return <ShieldAlert className="w-6 h-6 text-anomaly-high" />;
  };

  return (
    <Card className={cn(className, "cyber-border backdrop-blur-sm scanning-effect")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {getIcon()}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-40 h-24 mb-6">
          {/* Gauge background */}
          <div className="absolute w-full h-full overflow-hidden">
            <div className="w-40 h-40 border-[16px] border-secondary rounded-full"></div>
          </div>
          
          {/* Gauge value indicator */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div 
              className={cn("w-40 h-40 border-[16px] rounded-full", getColor())}
              style={{ 
                clipPath: `polygon(50% 50%, 50% 0%, ${angle <= 90 ? (50 + 50 * Math.tan(angle * Math.PI / 180)) : 100}% 0%, ${angle > 90 ? '100% ' + (50 - 50 * Math.tan((180 - angle) * Math.PI / 180)) + '%' : '100% 0%'}, ${angle >= 180 ? '0% 50%' : ''})` 
              }}
            ></div>
          </div>
          
          {/* Needle */}
          <div 
            className="absolute top-0 left-0 w-full h-24 flex justify-center"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center bottom' }}
          >
            <div className="w-1 h-20 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.7)]"></div>
          </div>
          
          {/* Center point */}
          <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.7)] -translate-x-1/2"></div>
        </div>
        
        <div className="text-center border-t border-border/30 pt-3 w-full">
          <p className={cn("text-2xl font-bold", getColor())}>{Math.round(normalizedValue * 100)}%</p>
          <p className={cn("text-sm font-medium", getColor())}>{getRiskLevel()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnomalyScoreGauge;
