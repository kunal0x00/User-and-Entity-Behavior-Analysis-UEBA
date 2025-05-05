
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  TooltipProps 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnomalyTrendProps {
  data: Array<{
    timestamp?: string;
    name?: string;
    value: number;
    anomalyScore?: number;
  }>;
  title: string;
  description?: string;
  className?: string;
  height?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const anomalyScore = payload[1]?.value;
    
    let anomalyStatus = "Normal";
    let statusColor = "text-anomaly-low";
    
    if (anomalyScore && anomalyScore > 0.7) {
      anomalyStatus = "High Risk";
      statusColor = "text-anomaly-high";
    } else if (anomalyScore && anomalyScore > 0.3) {
      anomalyStatus = "Medium Risk";
      statusColor = "text-anomaly-medium";
    }
    
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm">Value: <span className="font-medium">{value}</span></p>
        <p className="text-sm">Status: <span className={cn("font-medium", statusColor)}>{anomalyStatus}</span></p>
      </div>
    );
  }

  return null;
};

const AnomalyTrend = ({ 
  data, 
  title, 
  description, 
  className, 
  height = 300, 
  gradientFrom = "rgba(59, 130, 246, 0.2)", 
  gradientTo = "rgba(59, 130, 246, 0)" 
}: AnomalyTrendProps) => {
  // Process data to ensure it has a name property (use timestamp if available)
  const processedData = data.map(item => ({
    ...item,
    name: item.name || item.timestamp || ''
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-2">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={gradientTo} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} 
                stroke="rgba(255,255,255,0.1)"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} 
                stroke="rgba(255,255,255,0.1)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="rgba(59, 130, 246, 0.8)" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
              <Area 
                type="monotone" 
                dataKey="anomalyScore" 
                stroke="rgba(239, 68, 68, 0.8)" 
                fillOpacity={0} 
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnomalyTrend;
