
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { fetchLogs, logServerConfig, getLogServerUrl } from '@/services/logService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LogFileUploaderProps {
  onLogsProcessed: (fileAccessCount: number, logonActivityCount: number, networkActivityCount: number) => void;
  className?: string;
}

const LogFileUploader: React.FC<LogFileUploaderProps> = ({ onLogsProcessed, className }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Server configuration state
  const [serverIp, setServerIp] = useState(logServerConfig.ip);
  const [serverPort, setServerPort] = useState(logServerConfig.port.toString());
  const [showConfig, setShowConfig] = useState(false);

  const fetchLogData = async () => {
    setIsFetching(true);
    setError(null);
    
    try {
      // Update config with latest values
      logServerConfig.ip = serverIp;
      logServerConfig.port = parseInt(serverPort);
      
      const { fileAccessLogs, logonActivityLogs, networkActivityLogs } = await fetchLogs();
      
      setHasData(true);
      setLastFetched(new Date());
      
      onLogsProcessed(
        fileAccessLogs.length, 
        logonActivityLogs.length, 
        networkActivityLogs.length
      );
      
      toast({
        title: "Logs fetched successfully",
        description: `Found ${fileAccessLogs.length} file access logs, ${logonActivityLogs.length} logon activity logs, and ${networkActivityLogs.length} network activity logs.`,
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(`Could not connect to log server at ${getLogServerUrl()}`);
      toast({
        title: "Error fetching logs",
        description: `Could not connect to log server at ${getLogServerUrl()}. Please check your connection settings.`,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogData();
  }, []);

  const generatePDFReport = () => {
    toast({
      title: "Generating PDF Report",
      description: "Your report is being prepared...",
    });
    
    // This would be implemented with proper PDF generation
    // Currently just a placeholder
    setTimeout(() => {
      const doc = new jsPDF();
      doc.text("Security Log Analysis Report", 20, 20);
      doc.text("Generated on: " + new Date().toLocaleString(), 20, 30);
      doc.text("Log server: " + getLogServerUrl(), 20, 40);
      
      // Add more sections and visualizations based on log data
      doc.text("This report contains analysis of fetched log files", 20, 50);
      
      doc.save("security-log-report.pdf");
      
      toast({
        title: "PDF Report Generated",
        description: "Your report has been downloaded.",
      });
    }, 1000);
  };

  return (
    <Card className={`cyber-border backdrop-blur-sm scanning-effect ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Log Data Processor
        </CardTitle>
        <CardDescription>
          Fetches and analyzes log data from server
          {lastFetched && !error && (
            <span className="block text-xs mt-1 text-muted-foreground">
              Last fetched: {lastFetched.toLocaleString()}
            </span>
          )}
          {error && (
            <span className="block text-xs mt-1 text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {error}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full relative"
              disabled={isFetching}
              onClick={fetchLogData}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? "Fetching logs..." : "Refresh Log Data"}</span>
            </Button>
            
            {/* {hasData && (
              <Button 
                variant="secondary"
                className="w-full"
                onClick={generatePDFReport}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            )} */}
            
            <Button
              variant="ghost"
              className="w-full text-xs"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? "Hide Server Settings" : "Configure Server Connection"}
            </Button>
          </div>
          
          {showConfig && (
            <div className="space-y-3 p-3 border border-border/30 rounded-md">
              <div className="space-y-2">
                <Label htmlFor="server-ip">Log Server IP</Label>
                <Input 
                  id="server-ip"
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value)}
                  placeholder="e.g., localhost or 192.168.1.100"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="server-port">Log Server Port</Label>
                <Input 
                  id="server-port"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                  placeholder="e.g., 8081"
                  className="h-8"
                />
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>Connected to log server: {getLogServerUrl()}</p>
            <p className="mt-1">Parsing File_acess_log.ndjson, Login_event_log.ndjson, and Network_acess_log.ndjson</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogFileUploader;
