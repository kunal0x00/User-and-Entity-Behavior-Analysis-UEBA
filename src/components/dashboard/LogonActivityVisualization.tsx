
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { LogIn, Table } from 'lucide-react';
import { LogonActivityLog } from '@/services/mockData';
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

interface LogonActivityVisualizationProps {
  logs: LogonActivityLog[];
  className?: string;
}

const LogonActivityVisualization: React.FC<LogonActivityVisualizationProps> = ({ logs, className }) => {
  if (!logs.length) return null;
  
  // Process data for visualization
  const hostToLogins = logs.reduce<Record<string, {logins: number, failed: number}>>((acc, log) => {
    const hostname = log.Details.Hostname;
    if (!acc[hostname]) acc[hostname] = {logins: 0, failed: 0};
    
    acc[hostname].logins += log.Details["No. of Logins"] || 0;
    acc[hostname].failed += log.Details["No. of Failed Login Attempts"] || 0;
    
    return acc;
  }, {});
  
  // Transform into chart data
  const chartData = Object.entries(hostToLogins).map(([hostname, stats]) => {
    return {
      hostname,
      logins: stats.logins,
      failed: stats.failed,
      // Color based on failed login ratio
      color: stats.failed > 5 ? "var(--anomaly-high)" : 
             stats.failed > 2 ? "var(--anomaly-medium)" : 
             "var(--anomaly-low)"
    };
  }).sort((a, b) => (b.logins + b.failed) - (a.logins + a.failed));
  
  return (
    <Card className={cn("cyber-border backdrop-blur-sm max-h-auto overflow-y-visible", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Logon Activity Analysis
        </CardTitle>
        <CardDescription>
          {logs.length} logon activity events analyzed by host
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-2">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="h-auto sm:h-40 md:h-48">
              <ChartContainer
                config={{
                  logins: { label: "Successful Logins" },
                  failed: { label: "Failed Logins" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
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
                    dataKey="hostname" 
                    width={65}
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`, 
                      name === "logins" ? "Successful Logins" : "Failed Logins"
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Bar 
                    dataKey="logins" 
                    stackId="a"
                    fill="var(--anomaly-low)"
                    radius={[0, 0, 0, 0]}
                    barSize={16}
                  />
                  <Bar 
                    dataKey="failed" 
                    stackId="a" 
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="border border-border/30 rounded-md overflow-hidden h-auto overflow-y-auto">
              <UITable>
                <TableHeader className="bg-secondary/50 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="text-xs font-medium">Hostname</TableHead>
                    <TableHead className="text-xs font-medium text-right">Successful Logins</TableHead>
                    <TableHead className="text-xs font-medium text-right">Failed Logins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs font-medium">{item.hostname}</TableCell>
                      <TableCell className="text-xs text-right">{item.logins}</TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        <span className={
                          item.failed > 5 ? "text-anomaly-high" : 
                          item.failed > 2 ? "text-anomaly-medium" : 
                          "text-anomaly-low"
                        }>
                          {item.failed}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LogonActivityVisualization;
