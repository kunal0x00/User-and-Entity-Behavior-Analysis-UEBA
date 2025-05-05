
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchLogs, calculateRiskScore } from "@/services/logService";
import { toast } from "sonner";
import UserInvestigationModal from "@/components/reports/UserInvestigationModal";

interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  riskScore: number;
  anomalies: number;
  lastActive: Date;
  status: string;
}

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{user: string, riskScore: number} | null>(null);
  const [investigationModalOpen, setInvestigationModalOpen] = useState(false);
  const [logData, setLogData] = useState<{
    fileAccessLogs: any[],
    logonActivityLogs: any[],
    networkActivityLogs: any[]
  }>({
    fileAccessLogs: [],
    logonActivityLogs: [],
    networkActivityLogs: []
  });

  useEffect(() => {
    const loadRealUsers = async () => {
      setIsLoading(true);
      try {
        // Fetch logs from the log service
        const logs = await fetchLogs();
        setLogData(logs); // Store full logs for investigation
        
        // Extract unique users from logs and create a map to store their data
        const userMap = new Map<string, {
          fileAccess: number,
          logon: number,
          network: number,
          anomalies: number,
          lastActive: Date
        }>();
        
        // Process file access logs
        logs.fileAccessLogs.forEach(log => {
          const hostname = log.Details.Hostname;
          if (!hostname) return;
          
          const userData = userMap.get(hostname) || {
            fileAccess: 0,
            logon: 0,
            network: 0,
            anomalies: 0,
            lastActive: new Date()
          };
          
          // Update file access score
          userData.fileAccess = Math.max(userData.fileAccess, 
            log.Details["Number of Files Accessed"] ? log.Details["Number of Files Accessed"] / 30 : 0);
          
          // Check for anomalies
          if (log.Details["Number of Files Accessed"] > 20) {
            userData.anomalies++;
          }
          
          // Update last active time if the log has a date
          if (log.Details.Date) {
            const logDate = new Date(log.Details.Date);
            if (!isNaN(logDate.getTime())) {
              userData.lastActive = logDate;
            }
          }
          
          userMap.set(hostname, userData);
        });
        
        // Process logon activity logs
        logs.logonActivityLogs.forEach(log => {
          const hostname = log.Details.Hostname;
          if (!hostname) return;
          
          const userData = userMap.get(hostname) || {
            fileAccess: 0,
            logon: 0,
            network: 0,
            anomalies: 0,
            lastActive: new Date()
          };
          
          // Update logon activity score
          const failedLogins = log.Details["No. of Failed Login Attempts"] || 0;
          const accountLockouts = log.Details["No. of Account Lockout Attempts"] || 0;
          userData.logon = Math.max(userData.logon, 
            Math.min((failedLogins * 0.2) + (accountLockouts * 0.6), 1));
          
          // Check for anomalies
          if (failedLogins > 3 || accountLockouts > 0) {
            userData.anomalies++;
          }
          
          // Update last active time if the log has a date
          if (log.Details.Date) {
            const logDate = new Date(log.Details.Date);
            if (!isNaN(logDate.getTime())) {
              userData.lastActive = logDate;
            }
          }
          
          userMap.set(hostname, userData);
        });
        
        // Process network activity logs
        logs.networkActivityLogs.forEach(log => {
          const username = log.Details.user;
          if (!username) return;
          
          const userData = userMap.get(username) || {
            fileAccess: 0,
            logon: 0,
            network: 0,
            anomalies: 0,
            lastActive: new Date()
          };
          
          // Update network activity score
          const sentBytes = log.Details.sentbyte || 0;
          const rcvdBytes = log.Details.rcvdbyte || 0;
          const totalBytes = sentBytes + rcvdBytes;
          userData.network = Math.max(userData.network, 
            Math.min(totalBytes / 200000, 1));
          
          // Check for anomalies
          if (totalBytes > 100000) {
            userData.anomalies++;
          }
          
          // Update last active time if the log has a date
          if (log.Details.date) {
            const logDate = new Date(log.Details.date);
            if (!isNaN(logDate.getTime())) {
              userData.lastActive = logDate;
            }
          }
          
          userMap.set(username, userData);
        });
        
        // Convert map to array of user objects
        const realUsers: UserData[] = Array.from(userMap.entries()).map(([name, data]) => {
          // Calculate risk score
          const riskScore = calculateRiskScore(
            data.fileAccess || 0.1,
            data.logon || 0.1,
            data.network || 0.1
          );
          
          // Determine status based on recency of activity (arbitrary cutoff for demo)
          const now = new Date();
          const hoursDiff = (now.getTime() - data.lastActive.getTime()) / (1000 * 60 * 60);
          const status = hoursDiff < 4 ? "online" : "offline";
          
          // Extract email domain if possible
          let email = "";
          if (name.includes("@")) {
            email = name;
          } else {
            email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.org`;
          }
          
          // Generate unique ID
          const id = `user-${Math.random().toString(36).substring(2, 9)}`;
          
          // Determine department based on naming conventions (simplified example)
          let department = "Unknown";
          const lcName = name.toLowerCase();
          if (lcName.includes("admin")) department = "IT";
          else if (lcName.includes("user")) department = "General";
          else if (lcName.includes("krak")) department = "Engineering";
          else if (lcName.includes("jugnu")) department = "Operations";
          else if (lcName.includes("kunal")) department = "R&D";
          else if (lcName.includes("yeti")) department = "Security";
          else if (lcName.includes("wolf")) department = "IT";
          else if (lcName.includes("bear")) department = "Support";
          else if (lcName.includes("fox")) department = "IT";
          
          return {
            id,
            name,
            email,
            department,
            riskScore,
            anomalies: data.anomalies,
            lastActive: data.lastActive,
            status
          };
        });
        
        setUsers(realUsers);
      } catch (error) {
        console.error("Error loading real user data:", error);
        toast.error("Failed to load user data from logs");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRealUsers();
  }, []);

  const getRiskBadgeClass = (riskScore: number) => {
    if (riskScore >= 0.7) return "bg-anomaly-high/10 text-anomaly-high border-anomaly-high/40";
    if (riskScore >= 0.4) return "bg-anomaly-medium/10 text-anomaly-medium border-anomaly-medium/40";
    return "bg-anomaly-low/10 text-anomaly-low border-anomaly-low/40";
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 0.7) return "High Risk";
    if (riskScore >= 0.4) return "Medium Risk";
    return "Low Risk";
  };

  const getStatusBadgeClass = (status: string) => {
    return status === "online" 
      ? "bg-green-500/10 text-green-400 border-green-500/40" 
      : "bg-gray-500/10 text-gray-400 border-gray-500/40";
  };

  const handleInvestigateUser = (user: UserData) => {
    setSelectedUser({
      user: user.name,
      riskScore: user.riskScore
    });
    setInvestigationModalOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users & Entities</h1>
          <p className="text-muted-foreground">
            Monitor and investigate user behavior
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          <span>Filter</span>
        </Button>
        <div className="flex-1 md:text-right">
          <span className="text-sm text-muted-foreground">
            {filteredUsers.length} users
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading user data from logs...</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Anomalies</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              user.riskScore >= 0.7 ? "bg-anomaly-high" :
                              user.riskScore >= 0.4 ? "bg-anomaly-medium" : "bg-anomaly-low"
                            )}
                            style={{ width: `${user.riskScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{Math.round(user.riskScore * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.anomalies > 0 ? (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            user.anomalies >= 3 ? "bg-anomaly-high/10 text-anomaly-high border-anomaly-high/40" : 
                            "bg-anomaly-medium/10 text-anomaly-medium border-anomaly-medium/40"
                          )}
                        >
                          {user.anomalies} detected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-anomaly-low/10 text-anomaly-low border-anomaly-low/40">
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{user.lastActive.toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">{user.lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getStatusBadgeClass(user.status)}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInvestigateUser(user)}
                      >
                        Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <User size={24} className="mb-2" />
                      {searchQuery ? 'No users match your search criteria' : 'No users found in log data'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <UserInvestigationModal 
        open={investigationModalOpen}
        onOpenChange={setInvestigationModalOpen}
        userData={selectedUser}
        networkActivityLogs={logData.networkActivityLogs}
        fileAccessLogs={logData.fileAccessLogs}
        logonActivityLogs={logData.logonActivityLogs}
      />
    </DashboardLayout>
  );
};

export default UsersPage;
