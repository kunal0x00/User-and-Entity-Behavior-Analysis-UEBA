
import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, Clock, Calendar, BarChart2, Users, Shield, 
  FileBarChart, AlertTriangle, CheckCircle2, Printer, ExternalLink, ChevronDown,
  LineChart, Gauge, MailOpen, User, ArrowRight, Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchLogs, getLogServerUrl, calculateRiskScore, calculateFileAccessRiskScore, calculateLogonRiskScore, calculateNetworkRiskScore } from "@/services/logService";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";
import AnomalyTrend from "@/components/dashboard/AnomalyTrend";
import NetworkActivityGraph from "@/components/dashboard/NetworkActivityGraph";
import { Progress } from "@/components/ui/progress";
import { FileAccessLog, LogonActivityLog, NetworkActivityLog } from "@/services/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast as sonnerToast } from "sonner";
import EmailReportForm from "@/components/reports/EmailReportForm";
import UserInvestigationModal from "@/components/reports/UserInvestigationModal";

const ReportsPage = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("weekly");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [fileAccessLogs, setFileAccessLogs] = useState<FileAccessLog[]>([]);
  const [logonActivityLogs, setLogonActivityLogs] = useState<LogonActivityLog[]>([]);
  const [networkActivityLogs, setNetworkActivityLogs] = useState<NetworkActivityLog[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<{user: string, riskScore: number} | null>(null);
  const [investigationModalOpen, setInvestigationModalOpen] = useState(false);
  
  const fetchLogData = async () => {
    try {
      const logs = await fetchLogs();
      setFileAccessLogs(logs.fileAccessLogs);
      setLogonActivityLogs(logs.logonActivityLogs);
      setNetworkActivityLogs(logs.networkActivityLogs);
    } catch (error) {
      console.error("Error fetching logs for report:", error);
      toast({
        title: "Error fetching log data",
        description: "Could not retrieve log data for the report. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchLogData();
  }, []);

  // Process network activity data for visualization
  const processNetworkData = () => {
    if (!networkActivityLogs.length) return [];
    
    // Group logs by hour
    const byHour = networkActivityLogs.reduce((acc: Record<string, any>, log) => {
      const hour = log.Details.time.split(':')[0] || '00';
      const key = `${hour}:00`;
      
      if (!acc[key]) {
        acc[key] = { sentBytes: 0, receivedBytes: 0, anomalyScore: 0 };
      }
      
      acc[key].sentBytes += log.Details.sentbyte || 0;
      acc[key].receivedBytes += log.Details.rcvdbyte || 0;
      
      // Calculate anomaly score
      const totalBytes = (log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0);
      if (totalBytes > 100000) {
        acc[key].anomalyScore = Math.max(acc[key].anomalyScore, 0.8);
      } else if (totalBytes > 50000) {
        acc[key].anomalyScore = Math.max(acc[key].anomalyScore, 0.5);
      }
      
      return acc;
    }, {});
    
    return Object.entries(byHour).map(([timestamp, data]) => ({
      timestamp,
      sentBytes: data.sentBytes,
      receivedBytes: data.receivedBytes,
      anomalyScore: data.anomalyScore
    })).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  };
  
  // Calculate overall risk statistics
  const calculateRiskStats = () => {
    const users = new Set<string>();
    const userRiskScores: Record<string, {fileAccess: number, logon: number, network: number}> = {};
    
    // Process file access logs
    fileAccessLogs.forEach(log => {
      const hostname = log.Details.Hostname;
      users.add(hostname);
      
      if (!userRiskScores[hostname]) {
        userRiskScores[hostname] = { fileAccess: 0, logon: 0, network: 0 };
      }
      
      userRiskScores[hostname].fileAccess = calculateFileAccessRiskScore(log);
    });
    
    // Process logon activity logs
    logonActivityLogs.forEach(log => {
      const hostname = log.Details.Hostname;
      users.add(hostname);
      
      if (!userRiskScores[hostname]) {
        userRiskScores[hostname] = { fileAccess: 0, logon: 0, network: 0 };
      }
      
      userRiskScores[hostname].logon = calculateLogonRiskScore(log);
    });
    
    // Process network activity logs
    networkActivityLogs.forEach(log => {
      const username = log.Details.user;
      users.add(username);
      
      if (!userRiskScores[username]) {
        userRiskScores[username] = { fileAccess: 0, logon: 0, network: 0 };
      }
      
      userRiskScores[username].network = calculateNetworkRiskScore(log);
    });
    
    // Calculate total risk scores for each user
    const userTotalRiskScores = Object.entries(userRiskScores).map(([user, scores]) => {
      const totalRiskScore = calculateRiskScore(
        scores.fileAccess, 
        scores.logon, 
        scores.network
      );
      
      return { 
        user, 
        riskScore: totalRiskScore,
        scores: {
          fileAccess: scores.fileAccess,
          logon: scores.logon,
          network: scores.network
        }
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
    
    // Count users by risk level
    const criticalRisk = userTotalRiskScores.filter(u => u.riskScore > 0.8).length;
    const highRisk = userTotalRiskScores.filter(u => u.riskScore > 0.6 && u.riskScore <= 0.8).length;
    const mediumRisk = userTotalRiskScores.filter(u => u.riskScore > 0.3 && u.riskScore <= 0.6).length;
    const lowRisk = userTotalRiskScores.filter(u => u.riskScore <= 0.3).length;
    
    // Calculate anomaly counts
    const fileAnomalies = fileAccessLogs.filter(log => log.Details["Number of Files Accessed"] > 20).length;
    const loginAnomalies = logonActivityLogs.filter(log => 
      (log.Details["No. of Failed Login Attempts"] || 0) > 3 || 
      (log.Details["No. of Account Lockout Attempts"] || 0) > 0
    ).length;
    const networkAnomalies = networkActivityLogs.filter(log => 
      (log.Details.sentbyte || 0) > 100000 || 
      (log.Details.rcvdbyte || 0) > 100000
    ).length;
    
    // Get detailed anomaly information
    const fileAnomalyDetails = fileAccessLogs
      .filter(log => log.Details["Number of Files Accessed"] > 20)
      .map(log => ({
        user: log.Details.Hostname,
        type: 'File Access',
        details: `${log.Details["Number of Files Accessed"]} files accessed in a short period`,
        date: log.Details.Date,
        severity: log.Details["Number of Files Accessed"] > 30 ? 'High' : 'Medium'
      }));
    
    const loginAnomalyDetails = logonActivityLogs
      .filter(log => 
        (log.Details["No. of Failed Login Attempts"] || 0) > 3 || 
        (log.Details["No. of Account Lockout Attempts"] || 0) > 0
      )
      .map(log => ({
        user: log.Details.Hostname,
        type: 'Authentication',
        details: `${log.Details["No. of Failed Login Attempts"] || 0} failed attempts, ${log.Details["No. of Account Lockout Attempts"] || 0} lockouts`,
        date: log.Details.Date,
        severity: (log.Details["No. of Account Lockout Attempts"] || 0) > 0 ? 'Critical' : 'High'
      }));
    
    const networkAnomalyDetails = networkActivityLogs
      .filter(log => 
        (log.Details.sentbyte || 0) > 100000 || 
        (log.Details.rcvdbyte || 0) > 100000
      )
      .map(log => ({
        user: log.Details.user,
        type: 'Data Transfer',
        details: `Unusual data transfer: ${((log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0)).toLocaleString()} bytes`,
        date: log.Details.date,
        severity: ((log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0)) > 150000 ? 'Critical' : 'High'
      }));
    
    const anomalyDetails = [
      ...fileAnomalyDetails,
      ...loginAnomalyDetails,
      ...networkAnomalyDetails
    ].sort((a, b) => {
      // Sort by severity first
      const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
    });
    
    return {
      totalUsers: users.size,
      criticalRisk,
      highRisk,
      mediumRisk,
      lowRisk,
      topRiskUsers: userTotalRiskScores,
      fileAnomalies,
      loginAnomalies,
      networkAnomalies,
      totalAnomalies: fileAnomalies + loginAnomalies + networkAnomalies,
      anomalyDetails
    };
  };

  const handleInvestigateUser = (user: {user: string, riskScore: number}) => {
    setSelectedUser(user);
    setInvestigationModalOpen(true);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    // Notify user that report generation has started
    sonnerToast.loading("Generating your report...");
    
    setTimeout(async () => {
      try {
        if (!reportRef.current) {
          throw new Error("Report element not found");
        }
  
        // Generate PDF
        const pdf = new jsPDF("p", "mm", "a4");
        const reportElement = reportRef.current;
        
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#0f1729" // Match the dark theme background
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // If content exceeds one page, add more pages as needed
        let heightLeft = pdfHeight;
        let position = 0;
        
        while (heightLeft >= pdf.internal.pageSize.getHeight()) {
          position = heightLeft - pdf.internal.pageSize.getHeight();
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        // Save the PDF
        pdf.save(`Security_Log_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        
        // Close the loading toast and show success
        sonnerToast.dismiss();
        toast({
          title: "Report Generated Successfully",
          description: "Your security log analysis report has been generated and downloaded.",
        });
      } catch (error) {
        console.error("Error generating report:", error);
        sonnerToast.dismiss();
        toast({
          title: "Report Generation Failed",
          description: "There was a problem generating your report. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingReport(false);
      }
    }, 1000);
  };

  const riskStats = calculateRiskStats();
  const networkData = processNetworkData();

  return (
    <>
      <Helmet>
        <title>Reports | AnomalyGuard</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <div className="flex items-center gap-3">
              <Select 
                defaultValue={reportType} 
                onValueChange={setReportType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                <FileText className="mr-2 h-4 w-4" /> 
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="report-preview">
            <TabsList>
              <TabsTrigger value="report-preview">Report Preview</TabsTrigger>
              <TabsTrigger value="recent">Recent Reports</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            {/* Report Preview */}
            <TabsContent value="report-preview" className="mt-6">
              <div className="flex justify-end mb-4 space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <EmailReportForm 
                  reportTitle="Security Log Analysis" 
                  reportType={reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                  senderEmail="jukualt236@gmail.com"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>PDF</DropdownMenuItem>
                    <DropdownMenuItem>CSV</DropdownMenuItem>
                    <DropdownMenuItem>Excel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Report Content */}
              <div 
                className="border border-border rounded-lg p-6 bg-background space-y-6" 
                ref={reportRef}
              >
                {/* Report Header with attractive styling */}
                <div className="relative rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 p-6 mb-8">
                  <div className="absolute inset-0 bg-grid-white/10 opacity-10"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-cyan-200">
                          Security Vulnerability Assessment
                        </h1>
                        <p className="mt-2 text-gray-300 max-w-3xl">
                          Comprehensive analysis of system security logs with risk scoring and anomaly detection
                        </p>
                      </div>
                      <div className="hidden md:flex items-center justify-center bg-black/30 p-4 rounded-full border border-white/10">
                        <Shield className="h-12 w-12 text-purple-300" />
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-md">
                        <Calendar className="h-4 w-4 text-purple-300" />
                        <div>
                          <div className="text-gray-400">Generated on</div>
                          <div className="font-medium text-white">{new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-md">
                        <FileBarChart className="h-4 w-4 text-purple-300" />
                        <div>
                          <div className="text-gray-400">Report Type</div>
                          <div className="font-medium text-white">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Security Assessment</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-md">
                        <Shield className="h-4 w-4 text-purple-300" />
                        <div>
                          <div className="text-gray-400">Log Server</div>
                          <div className="font-medium text-white">{getLogServerUrl()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Executive Summary with improved visual styling */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-md">
                      <BarChart2 className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Executive Summary</h2>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                    <p className="text-sm text-muted-foreground mb-4">
                      This report provides a comprehensive analysis of security logs collected from the system,
                      highlighting potential security threats, unusual user behavior, and anomalous activities. 
                      The assessment is based on analysis of file access patterns, login activities, and network traffic.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Monitored Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Users className="h-8 w-8 text-purple-400" />
                            <div className="text-right">
                              <span className="text-2xl font-bold">{riskStats.totalUsers}</span>
                              <div className="text-xs text-muted-foreground">Active entities</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-700/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Detected Anomalies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                            <div className="text-right">
                              <span className="text-2xl font-bold">{riskStats.totalAnomalies}</span>
                              <div className="text-xs text-muted-foreground">Unusual activities</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-700/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">High Risk Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Shield className="h-8 w-8 text-amber-400" />
                            <div className="text-right">
                              <span className="text-2xl font-bold">{riskStats.highRisk + riskStats.criticalRisk}</span>
                              <div className="text-xs text-muted-foreground">Need investigation</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Security Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Gauge className="h-8 w-8 text-green-400" />
                            <div className="text-right">
                              <span className="text-2xl font-bold">
                                {Math.max(0, 100 - (riskStats.totalAnomalies * 5))}%
                              </span>
                              <div className="text-xs text-muted-foreground">System health</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
                
                {/* Key Findings Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Key Findings</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vulnerability Summary */}
                    <Card>
                      <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Critical Vulnerabilities
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {riskStats.totalAnomalies > 0 ? (
                          <div className="space-y-3">
                            {riskStats.loginAnomalies > 0 && (
                              <div className="p-3 rounded-md bg-red-900/20 border border-red-900/30">
                                <div className="font-medium text-red-400 mb-1">Authentication Anomalies</div>
                                <p className="text-sm text-muted-foreground">
                                  {riskStats.loginAnomalies} instances of failed login attempts or account lockouts detected.
                                  This may indicate brute force attacks or credential theft attempts.
                                </p>
                              </div>
                            )}
                            {riskStats.networkAnomalies > 0 && (
                              <div className="p-3 rounded-md bg-amber-900/20 border border-amber-900/30">
                                <div className="font-medium text-amber-400 mb-1">Data Exfiltration Risk</div>
                                <p className="text-sm text-muted-foreground">
                                  {riskStats.networkAnomalies} instances of unusually large data transfers detected.
                                  This may indicate unauthorized data access or exfiltration.
                                </p>
                              </div>
                            )}
                            {riskStats.fileAnomalies > 0 && (
                              <div className="p-3 rounded-md bg-purple-900/20 border border-purple-900/30">
                                <div className="font-medium text-purple-400 mb-1">Suspicious File Access</div>
                                <p className="text-sm text-muted-foreground">
                                  {riskStats.fileAnomalies} instances of unusual file access patterns detected.
                                  Users accessing a large number of files in short periods may indicate unauthorized activity.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                            <p className="text-muted-foreground">No critical vulnerabilities detected in this assessment period</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Risk Distribution */}
                    <Card>
                      <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Risk Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                                Critical Risk
                              </span>
                              <span className="text-sm font-medium text-red-500">{riskStats.criticalRisk}</span>
                            </div>
                            <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" 
                                style={{ width: `${(riskStats.criticalRisk / Math.max(riskStats.totalUsers, 1)) * 100}%` }} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Immediate attention required - severe security threats
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
                                High Risk
                              </span>
                              <span className="text-sm font-medium text-orange-500">{riskStats.highRisk}</span>
                            </div>
                            <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" 
                                style={{ width: `${(riskStats.highRisk / Math.max(riskStats.totalUsers, 1)) * 100}%` }} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Significant security risks requiring prompt investigation
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
                                Medium Risk
                              </span>
                              <span className="text-sm font-medium text-amber-500">{riskStats.mediumRisk}</span>
                            </div>
                            <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" 
                                style={{ width: `${(riskStats.mediumRisk / Math.max(riskStats.totalUsers, 1)) * 100}%` }} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Notable security concerns requiring monitoring
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                                Low Risk
                              </span>
                              <span className="text-sm font-medium text-green-500">{riskStats.lowRisk}</span>
                            </div>
                            <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" 
                                style={{ width: `${(riskStats.lowRisk / Math.max(riskStats.totalUsers, 1)) * 100}%` }} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Minimal security concerns under normal operation
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Network Activity Section with Visualization */}
                {/* <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-md">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Network Activity Analysis</h2>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                    <p className="text-sm text-muted-foreground mb-4">
                      Network traffic analysis reveals patterns of data transmission, potential data exfiltration, 
                      and anomalous communications. The graph below highlights unusual network activity that may 
                      indicate security threats.
                    </p>
                    
                    <div className="mt-4 h-80 border border-border/40 rounded-lg p-2">
                      <NetworkActivityGraph 
                        data={networkData} 
                        title="Network Traffic Analysis" 
                        description="Data transfer volumes with anomaly detection"
                      />
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-md bg-slate-900/50 border border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <h4 className="font-medium">Anomalous Traffic</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {riskStats.networkAnomalies} instances of high-volume data transfers detected that exceed 
                          normal baseline patterns. These may indicate lateral movement or exfiltration attempts.
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-md bg-slate-900/50 border border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">User Analysis</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {riskStats.topRiskUsers.filter(u => u.riskScore > 0.6).length} users showing unusual network 
                          patterns. The highest volume transfer was observed from 
                          user "{riskStats.topRiskUsers[0]?.user || 'N/A'}".
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-md bg-slate-900/50 border border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Recommendations</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Implement network traffic monitoring with volume thresholds and investigate all transfers 
                          exceeding 100KB, especially from administrative or privileged accounts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}
                
                {/* Detailed Anomalies Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Detected Anomalies</h2>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2 border-b border-border/50">
                      <CardTitle className="text-base">Detailed Security Incidents</CardTitle>
                      <CardDescription>
                        {riskStats.anomalyDetails.length} anomalies detected requiring investigation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {riskStats.anomalyDetails.length > 0 ? (
                          <div className="rounded-lg overflow-hidden border border-border">
                            <table className="w-full">
                              <thead className="bg-background/30">
                                <tr>
                                  <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">User</th>
                                  <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Type</th>
                                  <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Details</th>
                                  <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Date</th>
                                  <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Severity</th>
                                  <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {riskStats.anomalyDetails.slice(0, 8).map((anomaly, idx) => (
                                  <tr key={idx} className="hover:bg-background/40">
                                    <td className="px-4 py-3 text-sm">{anomaly.user}</td>
                                    <td className="px-4 py-3 text-sm">{anomaly.type}</td>
                                    <td className="px-4 py-3 text-sm">{anomaly.details}</td>
                                    <td className="px-4 py-3 text-sm">{anomaly.date}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        anomaly.severity === 'Critical' ? 'bg-red-900/30 text-red-400' :
                                        anomaly.severity === 'High' ? 'bg-orange-900/30 text-orange-400' : 
                                        'bg-amber-900/30 text-amber-400'
                                      }`}>
                                        {anomaly.severity}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 text-xs"
                                        onClick={() => handleInvestigateUser({ user: anomaly.user, riskScore: 0.8 })}
                                      >
                                        Investigate
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-3" />
                            <p className="text-lg font-medium">No anomalies detected</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              All user activities are within normal operational parameters
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* High Risk Users Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-md">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">High Risk Users</h2>
                  </div>
                  
                  <Card className="border-red-900/30">
                    <CardHeader className="pb-2 bg-gradient-to-r from-red-900/30 to-orange-900/20 border-b border-red-900/20">
                      <CardTitle className="text-base">Users Requiring Immediate Investigation</CardTitle>
                      <CardDescription>Ranked by calculated risk score based on combined activity metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-5">
                        {riskStats.topRiskUsers.slice(0, 5).map((user, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3
                                ${user.riskScore > 0.8 ? 'bg-red-900/40 text-red-400' : 
                                user.riskScore > 0.6 ? 'bg-orange-900/40 text-orange-400' :
                                user.riskScore > 0.4 ? 'bg-amber-900/40 text-amber-400' :
                                'bg-green-900/40 text-green-400'}`}
                              >
                                <span className="text-sm font-bold">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">{user.user}</h4>
                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                      <span className={`px-1.5 py-0.5 rounded-full ${
                                        user.riskScore > 0.8 ? 'bg-red-900/30 text-red-400' : 
                                        user.riskScore > 0.6 ? 'bg-orange-900/30 text-orange-400' :
                                        user.riskScore > 0.4 ? 'bg-amber-900/30 text-amber-400' :
                                        'bg-green-900/30 text-green-400'
                                      }`}>
                                        Risk Score: {Math.round(user.riskScore * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7"
                                    onClick={() => handleInvestigateUser(user)}
                                  >
                                    Investigate
                                  </Button>
                                </div>
                                <Progress 
                                  value={user.riskScore * 100}
                                  className={`h-1 mt-2 ${
                                    user.riskScore > 0.8 ? 'bg-red-900/20' : 
                                    user.riskScore > 0.6 ? 'bg-orange-900/20' :
                                    user.riskScore > 0.4 ? 'bg-amber-900/20' :
                                    'bg-green-900/20'
                                  }`}
                                  indicatorClassName={
                                    user.riskScore > 0.8 ? 'bg-red-500' : 
                                    user.riskScore > 0.6 ? 'bg-orange-500' :
                                    user.riskScore > 0.4 ? 'bg-amber-500' :
                                    'bg-green-500'
                                  }
                                />
                              </div>
                            </div>
                            
                            {/* User Risk Factors */}
                            <div className="pl-11 grid grid-cols-3 gap-2 mt-1">
                              <div className="p-2 rounded bg-card/50 border border-border/30">
                                <div className="text-xs text-muted-foreground">File Access</div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{Math.round(user.scores?.fileAccess * 100 || 0)}%</span>
                                  <div className="w-16 h-1 rounded-full bg-background overflow-hidden">
                                    <div 
                                      className="h-full bg-purple-500" 
                                      style={{width: `${(user.scores?.fileAccess || 0) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-2 rounded bg-card/50 border border-border/30">
                                <div className="text-xs text-muted-foreground">Authentication</div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{Math.round(user.scores?.logon * 100 || 0)}%</span>
                                  <div className="w-16 h-1 rounded-full bg-background overflow-hidden">
                                    <div 
                                      className="h-full bg-red-500" 
                                      style={{width: `${(user.scores?.logon || 0) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-2 rounded bg-card/50 border border-border/30">
                                <div className="text-xs text-muted-foreground">Network</div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{Math.round(user.scores?.network * 100 || 0)}%</span>
                                  <div className="w-16 h-1 rounded-full bg-background overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500" 
                                      style={{width: `${(user.scores?.network || 0) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-card/30 border-t border-border/30 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                        <span>View all high risk users</span>
                        <ArrowRight size={12} />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="p-4 text-center text-muted-foreground">
                <p>Your previous reports will appear here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled">
              <div className="p-4 text-center text-muted-foreground">
                <p>Set up automated report generation on a schedule.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <div className="p-4 text-center text-muted-foreground">
                <p>Customize and save report templates for future use.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <UserInvestigationModal 
          open={investigationModalOpen}
          onOpenChange={setInvestigationModalOpen}
          userData={selectedUser}
          networkActivityLogs={networkActivityLogs}
          fileAccessLogs={fileAccessLogs}
          logonActivityLogs={logonActivityLogs}
        />
      </DashboardLayout>
    </>
  );
};

export default ReportsPage;
