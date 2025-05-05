
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { AlertCircle } from 'lucide-react';

interface NetworkActivityGraphProps {
  data: Array<{
    timestamp: string;
    sentBytes: number;
    receivedBytes: number;
    anomalyScore?: number;
  }>;
  title: string;
  description?: string;
}

const NetworkActivityGraph: React.FC<NetworkActivityGraphProps> = ({ 
  data, 
  title, 
  description 
}) => {
  // Identify anomalies based on anomaly score threshold
  const anomalies = data.filter(item => (item.anomalyScore && item.anomalyScore > 0.7));
  
  // Format bytes to more readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Custom tooltip formatter
  const customTooltipFormatter = (value: number, name: string) => {
    if (name === "sentBytes") return [formatBytes(value), "Sent"];
    if (name === "receivedBytes") return [formatBytes(value), "Received"];
    return [value, name];
  };

  return (
    <Card className="cyber-border backdrop-blur-sm scanning-effect">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {anomalies.length > 0 && (
            <div className="flex items-center gap-1 text-anomaly-high bg-anomaly-high/10 px-2 py-1 rounded-md text-xs">
              <AlertCircle size={14} />
              <span>{anomalies.length} anomalies detected</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ChartContainer
            config={{
              sent: { label: "Sent" },
              received: { label: "Received" },
              anomaly: { label: "Anomaly", color: "#ef4444" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                  stroke="rgba(255,255,255,0.1)"
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                  stroke="rgba(255,255,255,0.1)"
                  name="Bytes"
                  tickFormatter={formatBytes}
                  label={{ 
                    value: "Bytes", 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.6)' }
                  }}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sentBytes" 
                  name="sent"
                  stroke="#9b87f5" 
                  dot={false}
                  activeDot={{ r: 5, stroke: "#9b87f5", strokeWidth: 1, fill: "#9b87f5" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="receivedBytes" 
                  name="received"
                  stroke="#10b981" 
                  dot={false}
                  activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 1, fill: "#10b981" }}
                />
                
                {/* Anomaly threshold reference line */}
                <ReferenceLine y={100000} stroke="#ef4444" strokeDasharray="3 3" />

                {/* Highlight anomalies */}
                {anomalies.map((anomaly, index) => (
                  <ReferenceLine
                    key={`anomaly-${index}`}
                    x={anomaly.timestamp}
                    stroke="#ef4444"
                    strokeWidth={2}
                    label={{
                      value: "!",
                      fill: "#ef4444",
                      fontSize: 12,
                      position: "top"
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkActivityGraph;
