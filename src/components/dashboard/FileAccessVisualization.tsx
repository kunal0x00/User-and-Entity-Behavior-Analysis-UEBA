import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { FileText, Table } from 'lucide-react';
import { FileAccessLog } from '@/services/mockData';
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

interface FileAccessVisualizationProps {
  logs: FileAccessLog[];
  className?: string;
}

const FileAccessVisualization: React.FC<FileAccessVisualizationProps> = ({ logs, className }) => {
  if (!logs.length) return null;
  
  // Process data for visualization
  const hostToFiles = logs.reduce<Record<string, {day: number, period: number, count: number}[]>>((acc, log) => {
    const hostname = log.Details.Hostname;
    if (!acc[hostname]) acc[hostname] = [];
    
    acc[hostname].push({
      day: log.Details.Day,
      period: log.Details["Time Period"],
      count: log.Details["Number of Files Accessed"]
    });
    
    return acc;
  }, {});
  
  // Transform into chart data
  const chartData = Object.entries(hostToFiles).map(([hostname, accesses]) => {
    const totalFiles = accesses.reduce((sum, access) => sum + access.count, 0);
    
    return {
      hostname,
      totalFiles,
      // Color based on access volume
      color: totalFiles > 50 ? "var(--anomaly-high)" : 
             totalFiles > 20 ? "var(--anomaly-medium)" : 
             "var(--anomaly-low)"
    };
  }).sort((a, b) => b.totalFiles - a.totalFiles);
  
  const dayMapper = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const periodMapper = ["", "Morning (00:00-06:00)", "Day (06:00-12:00)", "Afternoon (12:00-18:00)", "Night (18:00-24:00)"];

  return (
    <Card className={cn("cyber-border backdrop-blur-sm max-h-auto overflow-y-visible", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File Access Analysis
        </CardTitle>
        <CardDescription>
          {logs.length} file access events analyzed by host and time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-2">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="max-h-auto overflow-y-visible sm:h-40 md:h-auto">
              <ChartContainer
                config={{
                  fileAccess: { label: "Files Accessed" },
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
                    dataKey="hostname" 
                    width={65}
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} files`, 'Files Accessed']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Bar 
                    dataKey="totalFiles" 
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="border border-border/30 rounded-md overflow-hidden max-h-48 overflow-y-auto">
              <UITable>
                <TableHeader className="bg-secondary/50 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="text-xs font-medium">Hostname</TableHead>
                    <TableHead className="text-xs font-medium">Day</TableHead>
                    <TableHead className="text-xs font-medium">Time Period</TableHead>
                    <TableHead className="text-xs font-medium text-right">Files Accessed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs font-medium">{log.Details.Hostname}</TableCell>
                      <TableCell className="text-xs">{dayMapper[log.Details.Day] || "Unknown"}</TableCell>
                      <TableCell className="text-xs">{periodMapper[log.Details["Time Period"]] || "Unknown"}</TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        <span className={
                          log.Details["Number of Files Accessed"] > 50 ? "text-anomaly-high" : 
                          log.Details["Number of Files Accessed"] > 20 ? "text-anomaly-medium" : 
                          "text-anomaly-low"
                        }>
                          {log.Details["Number of Files Accessed"]}
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

export default FileAccessVisualization;
