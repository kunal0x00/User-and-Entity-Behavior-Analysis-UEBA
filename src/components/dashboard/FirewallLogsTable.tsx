
import React, { useState } from "react";
import { SearchIcon, FilterIcon, DownloadIcon } from "lucide-react";
import { 
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FirewallLog } from "@/services/mockData";

interface FirewallLogsTableProps {
  logs: FirewallLog[];
  className?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const FirewallLogsTable = ({ logs, className }: FirewallLogsTableProps) => {
  const [filter, setFilter] = useState("");
  const [visibleRows, setVisibleRows] = useState(10);
  
  const filteredLogs = logs.filter((log) => 
    log.user.toLowerCase().includes(filter.toLowerCase()) || 
    log.dstport.toString().includes(filter)
  ).slice(0, visibleRows);
  
  const handleLoadMore = () => {
    setVisibleRows(prev => prev + 10);
  };

  // Function to determine if a row has anomalous values
  const isAnomalous = (log: FirewallLog) => {
    return log.sentbyte > 100000 || log.rcvdbyte > 100000;
  };
  
  return (
    <div className="glass-card p-4 relative overflow-hidden scanning-effect">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            Firewall Logs
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
              Live Data
            </span>
          </h2>
          <div className="flex gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by user or port..."
                className="pl-8 h-9 w-64 bg-secondary/50 border-border/50 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <FilterIcon className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-1">
              <DownloadIcon className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        <div className="border border-border/30 rounded-md overflow-hidden relative">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="bg-secondary/50 backdrop-blur-sm sticky top-0">
                <TableRow>
                  <TableHead className="text-xs font-medium">Date</TableHead>
                  <TableHead className="text-xs font-medium">Time</TableHead>
                  <TableHead className="text-xs font-medium">User</TableHead>
                  <TableHead className="text-xs font-medium">Port</TableHead>
                  <TableHead className="text-xs font-medium">Duration</TableHead>
                  <TableHead className="text-xs font-medium">Sent</TableHead>
                  <TableHead className="text-xs font-medium">Received</TableHead>
                  <TableHead className="text-xs font-medium">Sent Pkts</TableHead>
                  <TableHead className="text-xs font-medium">Rcvd Pkts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow 
                    key={index} 
                    className={isAnomalous(log) ? "bg-destructive/10 hover:bg-destructive/20" : ""}
                  >
                    <TableCell className="text-xs">{log.date}</TableCell>
                    <TableCell className="text-xs">{log.time}</TableCell>
                    <TableCell className="text-xs font-medium">{log.user}</TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-1 rounded-full bg-secondary/50 text-xs">
                        {log.dstport}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{log.duration}ms</TableCell>
                    <TableCell className="text-xs">{formatBytes(log.sentbyte)}</TableCell>
                    <TableCell className="text-xs">{formatBytes(log.rcvdbyte)}</TableCell>
                    <TableCell className="text-xs">{log.sentpkt}</TableCell>
                    <TableCell className="text-xs">{log.rcvdpkt}</TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className="bg-secondary/30">
                <TableRow>
                  <TableCell colSpan={9} className="text-xs text-right">
                    Showing {filteredLogs.length} of {logs.length} logs
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
        
        {visibleRows < logs.length && (
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoadMore}
              className="text-xs"
            >
              Load More
            </Button>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <div>Last updated: 1 minute ago</div>
          <div>
            <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1 animate-pulse-slow"></span>
            Monitoring active
          </div>
        </div>
      </div>
      
      {/* Decorative cyber elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>
    </div>
  );
};

export default FirewallLogsTable;
