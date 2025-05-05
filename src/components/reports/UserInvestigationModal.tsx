
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, AlertTriangle, CheckCircle2, Clock, FileText, Network } from "lucide-react";
import { FileAccessLog, LogonActivityLog, NetworkActivityLog } from "@/services/mockData";

interface UserInvestigationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: { user: string; riskScore: number } | null;
  networkActivityLogs: NetworkActivityLog[];
  fileAccessLogs: FileAccessLog[];
  logonActivityLogs: LogonActivityLog[];
}

const UserInvestigationModal: React.FC<UserInvestigationModalProps> = ({
  open,
  onOpenChange,
  userData,
  networkActivityLogs,
  fileAccessLogs,
  logonActivityLogs
}) => {
  const [userActivities, setUserActivities] = useState<{
    network: NetworkActivityLog[];
    file: FileAccessLog[];
    logon: LogonActivityLog[];
  }>({
    network: [],
    file: [],
    logon: []
  });

  useEffect(() => {
    if (userData && userData.user) {
      // Filter logs for this specific user
      const networkLogs = networkActivityLogs.filter(log => log.Details.user === userData.user);
      const fileLogs = fileAccessLogs.filter(log => log.Details.Hostname === userData.user);
      const logonLogs = logonActivityLogs.filter(log => log.Details.Hostname === userData.user);
      
      setUserActivities({
        network: networkLogs,
        file: fileLogs,
        logon: logonLogs
      });
    }
  }, [userData, networkActivityLogs, fileAccessLogs, logonActivityLogs]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              ${userData.riskScore > 0.8 ? 'bg-red-900/40 text-red-400' : 
              userData.riskScore > 0.6 ? 'bg-orange-900/40 text-orange-400' :
              userData.riskScore > 0.4 ? 'bg-amber-900/40 text-amber-400' :
              'bg-green-900/40 text-green-400'}`}
            >
              <User className="h-4 w-4" />
            </div>
            <span>User Investigation: {userData.user}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of user activities and risk factors
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* User Summary */}
          <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg border border-border/50">
            <div className="flex-1">
              <div className="font-medium">{userData.user}</div>
              <div className="text-sm text-muted-foreground">Risk Score: {Math.round(userData.riskScore * 100)}%</div>
              <Progress 
                value={userData.riskScore * 100} 
                className="h-1.5 mt-2"
                indicatorClassName={
                  userData.riskScore > 0.8 ? 'bg-red-500' : 
                  userData.riskScore > 0.6 ? 'bg-orange-500' :
                  userData.riskScore > 0.4 ? 'bg-amber-500' :
                  'bg-green-500'
                }
              />
            </div>
            <Badge 
              variant="outline" 
              className={`text-sm px-3 py-1 ${
                userData.riskScore > 0.8 ? 'bg-red-900/20 text-red-400 border-red-500/30' : 
                userData.riskScore > 0.6 ? 'bg-orange-900/20 text-orange-400 border-orange-500/30' :
                userData.riskScore > 0.4 ? 'bg-amber-900/20 text-amber-400 border-amber-500/30' :
                'bg-green-900/20 text-green-400 border-green-500/30'
              }`}
            >
              {userData.riskScore > 0.8 ? 'Critical Risk' : 
               userData.riskScore > 0.6 ? 'High Risk' : 
               userData.riskScore > 0.4 ? 'Medium Risk' : 'Low Risk'}
            </Badge>
          </div>
          
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="network">Network Activity</TabsTrigger>
              <TabsTrigger value="file">File Access</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">User Risk Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-card/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-400" />
                          <div className="font-medium">Detected Anomalies</div>
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                          {userActivities.file.filter(log => log.Details["Number of Files Accessed"] > 20).length +
                           userActivities.logon.filter(log => (log.Details["No. of Failed Login Attempts"] || 0) > 3).length +
                           userActivities.network.filter(log => ((log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0)) > 100000).length}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Activities outside normal patterns
                        </div>
                      </div>
                      
                      <div className="p-4 bg-card/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-400" />
                          <div className="font-medium">Last Activity</div>
                        </div>
                        <div className="mt-2 text-sm font-medium">
                          {formatDate(
                            [...userActivities.file.map(log => log.Details.Date), 
                             ...userActivities.logon.map(log => log.Details.Date),
                             ...userActivities.network.map(log => log.Details.date)]
                            .sort()
                            .pop()
                          )}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Most recent logged activity
                        </div>
                      </div>
                      
                      <div className="p-4 bg-card/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-purple-400" />
                          <div className="font-medium">Total Activities</div>
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                          {userActivities.file.length +
                           userActivities.logon.length +
                           userActivities.network.length}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Across network, file, and auth logs
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Notable Activities</h3>
                      {(userActivities.file.length === 0 && 
                        userActivities.logon.length === 0 && 
                        userActivities.network.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                          <p className="text-muted-foreground">No activities found for this user</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userActivities.file.filter(log => log.Details["Number of Files Accessed"] > 20).length > 0 && (
                            <div className="p-3 bg-purple-900/10 border border-purple-900/20 rounded-lg">
                              <div className="font-medium text-purple-400">Unusual File Access</div>
                              <p className="text-sm mt-1">
                                User accessed large numbers of files in short time periods
                              </p>
                            </div>
                          )}
                          
                          {userActivities.logon.filter(log => (log.Details["No. of Failed Login Attempts"] || 0) > 3).length > 0 && (
                            <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
                              <div className="font-medium text-red-400">Authentication Failures</div>
                              <p className="text-sm mt-1">
                                Multiple failed login attempts detected
                              </p>
                            </div>
                          )}
                          
                          {userActivities.network.filter(log => ((log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0)) > 100000).length > 0 && (
                            <div className="p-3 bg-amber-900/10 border border-amber-900/20 rounded-lg">
                              <div className="font-medium text-amber-400">Large Data Transfers</div>
                              <p className="text-sm mt-1">
                                Unusually large network data transfers detected
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Network Activity Tab */}
            <TabsContent value="network">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Network Activity Logs
                  </CardTitle>
                  <CardDescription>
                    {userActivities.network.length} network events recorded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userActivities.network.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No network activity found for this user</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 text-sm font-medium">Date/Time</th>
                              <th className="text-left p-2 text-sm font-medium">Destination Port</th>
                              <th className="text-left p-2 text-sm font-medium">Duration</th>
                              <th className="text-left p-2 text-sm font-medium">Sent</th>
                              <th className="text-left p-2 text-sm font-medium">Received</th>
                              <th className="text-left p-2 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {userActivities.network.map((log, i) => {
                              const totalBytes = (log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0);
                              const isAnomaly = totalBytes > 100000;
                              
                              return (
                                <tr key={i} className={isAnomaly ? "bg-amber-950/10" : ""}>
                                  <td className="p-2 text-sm">
                                    {log.Details.date} {log.Details.time}
                                  </td>
                                  <td className="p-2 text-sm">{log.Details.dstport}</td>
                                  <td className="p-2 text-sm">{log.Details.duration}s</td>
                                  <td className="p-2 text-sm">{log.Details.sentbyte?.toLocaleString()} B</td>
                                  <td className="p-2 text-sm">{log.Details.rcvdbyte?.toLocaleString()} B</td>
                                  <td className="p-2 text-sm">
                                    {isAnomaly && (
                                      <Badge variant="outline" className="bg-amber-900/20 text-amber-400 border-amber-500/30">
                                        Anomaly
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* File Access Tab */}
            <TabsContent value="file">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File Access Logs
                  </CardTitle>
                  <CardDescription>
                    {userActivities.file.length} file access events recorded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userActivities.file.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No file access activity found for this user</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 text-sm font-medium">Date</th>
                              <th className="text-left p-2 text-sm font-medium">Time Period</th>
                              <th className="text-left p-2 text-sm font-medium">Day</th>
                              <th className="text-left p-2 text-sm font-medium">Files Accessed</th>
                              <th className="text-left p-2 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {userActivities.file.map((log, i) => {
                              const isAnomaly = log.Details["Number of Files Accessed"] > 20;
                              
                              return (
                                <tr key={i} className={isAnomaly ? "bg-purple-950/10" : ""}>
                                  <td className="p-2 text-sm">{log.Details.Date}</td>
                                  <td className="p-2 text-sm">{log.Details["Time Period"]}</td>
                                  <td className="p-2 text-sm">{log.Details.Day}</td>
                                  <td className="p-2 text-sm">{log.Details["Number of Files Accessed"]}</td>
                                  <td className="p-2 text-sm">
                                    {isAnomaly && (
                                      <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-500/30">
                                        Anomaly
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Authentication Tab */}
            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Authentication Logs
                  </CardTitle>
                  <CardDescription>
                    {userActivities.logon.length} authentication events recorded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userActivities.logon.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No authentication activity found for this user</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 text-sm font-medium">Date</th>
                              <th className="text-left p-2 text-sm font-medium">Time Period</th>
                              <th className="text-left p-2 text-sm font-medium">Logins</th>
                              <th className="text-left p-2 text-sm font-medium">Logouts</th>
                              <th className="text-left p-2 text-sm font-medium">Failed Attempts</th>
                              <th className="text-left p-2 text-sm font-medium">Lockouts</th>
                              <th className="text-left p-2 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {userActivities.logon.map((log, i) => {
                              const failedAttempts = log.Details["No. of Failed Login Attempts"] || 0;
                              const lockouts = log.Details["No. of Account Lockout Attempts"] || 0;
                              const isAnomaly = failedAttempts > 3 || lockouts > 0;
                              
                              return (
                                <tr key={i} className={isAnomaly ? "bg-red-950/10" : ""}>
                                  <td className="p-2 text-sm">{log.Details.Date}</td>
                                  <td className="p-2 text-sm">{log.Details["Time Period"]}</td>
                                  <td className="p-2 text-sm">{log.Details["No. of Logins"]}</td>
                                  <td className="p-2 text-sm">{log.Details["No. of Logouts"]}</td>
                                  <td className="p-2 text-sm">{failedAttempts}</td>
                                  <td className="p-2 text-sm">{lockouts}</td>
                                  <td className="p-2 text-sm">
                                    {isAnomaly && (
                                      <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-500/30">
                                        Anomaly
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserInvestigationModal;
