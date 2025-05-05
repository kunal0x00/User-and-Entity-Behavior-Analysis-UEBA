
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Network, Table } from 'lucide-react';
import { NetworkActivityLog } from '@/services/mockData';
import { cn } from '@/lib/utils';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NetworkActivityVisualizationProps {
  logs: NetworkActivityLog[];
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const NetworkActivityVisualization: React.FC<NetworkActivityVisualizationProps> = ({ logs, className }) => {
  if (!logs.length) return null;
  
  // Process data for visualization - aggregate by user
  const userToTraffic = logs.reduce<Record<string, {sent: number, received: number}>>((acc, log) => {
    const user = log.Details.user;
    if (!acc[user]) acc[user] = { sent: 0, received: 0 };
    
    acc[user].sent += log.Details.sentbyte || 0;
    acc[user].received += log.Details.rcvdbyte || 0;
    
    return acc;
  }, {});
  
  // Transform into chart data
  const chartData = Object.entries(userToTraffic).map(([user, traffic]) => {
    const totalTraffic = traffic.sent + traffic.received;
    
    return {
      user,
      sent: traffic.sent,
      received: traffic.received,
      // Color based on total traffic volume
      color: totalTraffic > 100000 ? "var(--anomaly-high)" : 
             totalTraffic > 50000 ? "var(--anomaly-medium)" : 
             "var(--anomaly-low)"
    };
  }).sort((a, b) => (b.sent + b.received) - (a.sent + a.received));

  return (
    <Card className={cn("cyber-border  backdrop-blur  max-h-auto overflow-y-visible", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Network Traffic Analysis
        </CardTitle>
        <CardDescription>
          {logs.length} network activity events analyzed by user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-2">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="h-auto">
              <ChartContainer
                config={{
                  sent: { label: "Data Sent" },
                  received: { label: "Data Received" }
                }}
              >
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="user" 
                    width={65}
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatBytes(value), 'Data Volume']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Bar 
                    dataKey="sent" 
                    stackId="a"
                    fill="rgba(16, 185, 129, 0.7)"
                    radius={[0, 0, 0, 0]}
                    barSize={16}
                  />
                  <Bar 
                    dataKey="received" 
                    stackId="a" 
                    fill="rgba(59, 130, 246, 0.7)"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="border border-border/30 rounded-md overflow-hidden max-h-[16rem] overflow-y-auto">
              <UITable>
                <TableHeader className="bg-secondary/50 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="text-xs font-medium">User</TableHead>
                    <TableHead className="text-xs font-medium text-right">Data Sent</TableHead>
                    <TableHead className="text-xs font-medium text-right">Data Received</TableHead>
                    <TableHead className="text-xs font-medium text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((item, idx) => {
                    const total = item.sent + item.received;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium">{item.user}</TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          <span className="text-emerald-400">{formatBytes(item.sent)}</span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          <span className="text-blue-400">{formatBytes(item.received)}</span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          <span className={
                            total > 100000 ? "text-anomaly-high" : 
                            total > 50000 ? "text-anomaly-medium" : 
                            "text-anomaly-low"
                          }>
                            {formatBytes(total)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </UITable>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NetworkActivityVisualization;
