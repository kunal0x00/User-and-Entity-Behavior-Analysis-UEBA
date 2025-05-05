
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, User, AlertTriangle, Clock, Calendar, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FileAccessLog, LogonActivityLog, NetworkActivityLog } from "@/services/mockData";
import { fetchLogs, calculateRiskScore } from "@/services/logService";
import UserInvestigationModal from "@/components/reports/UserInvestigationModal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface Investigation {
  id: string;
  user: string;
  date: string;
  status: 'ongoing' | 'completed' | 'scheduled';
  riskScore: number;
  reason: string;
  analyst?: string;
}

const InvestigationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileAccessLogs, setFileAccessLogs] = useState<FileAccessLog[]>([]);
  const [logonActivityLogs, setLogonActivityLogs] = useState<LogonActivityLog[]>([]);
  const [networkActivityLogs, setNetworkActivityLogs] = useState<NetworkActivityLog[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [riskUsers, setRiskUsers] = useState<{user: string, riskScore: number, reason: string}[]>([]);

  // Fetch logs on component mount
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await fetchLogs();
        setFileAccessLogs(logs.fileAccessLogs);
        setLogonActivityLogs(logs.logonActivityLogs);
        setNetworkActivityLogs(logs.networkActivityLogs);
        
        // Generate risk users from logs
        const userMap = new Map<string, {fileAccess: number, logon: number, network: number, reason: string}>();
        
        // Process file access logs
        logs.fileAccessLogs.forEach(log => {
          const hostname = log.Details.Hostname;
          const existingData = userMap.get(hostname) || { fileAccess: 0, logon: 0, network: 0, reason: "" };
          
          // Check for high risk file access
          if (log.Details["Number of Files Accessed"] > 20) {
            existingData.fileAccess = Math.max(existingData.fileAccess, 0.7);
            existingData.reason = "High volume of file access detected";
          }
          
          userMap.set(hostname, existingData);
        });
        
        // Process logon activity logs
        logs.logonActivityLogs.forEach(log => {
          const hostname = log.Details.Hostname;
          const existingData = userMap.get(hostname) || { fileAccess: 0, logon: 0, network: 0, reason: "" };
          
          // Check for failed login attempts
          if ((log.Details["No. of Failed Login Attempts"] || 0) > 3) {
            existingData.logon = Math.max(existingData.logon, 0.8);
            existingData.reason = "Multiple failed login attempts";
          }
          
          // Check for account lockout attempts
          if ((log.Details["No. of Account Lockout Attempts"] || 0) > 0) {
            existingData.logon = Math.max(existingData.logon, 0.9);
            existingData.reason = "Account lockout detected";
          }
          
          userMap.set(hostname, existingData);
        });
        
        // Process network activity logs
        logs.networkActivityLogs.forEach(log => {
          const user = log.Details.user;
          const existingData = userMap.get(user) || { fileAccess: 0, logon: 0, network: 0, reason: "" };
          
          // Check for high volume data transfers
          if ((log.Details.sentbyte || 0) > 100000) {
            existingData.network = Math.max(existingData.network, 0.7);
            existingData.reason = "Large data upload detected";
          }
          
          if ((log.Details.rcvdbyte || 0) > 100000) {
            existingData.network = Math.max(existingData.network, 0.7);
            existingData.reason = "Large data download detected";
          }
          
          userMap.set(user, existingData);
        });
        
        // Calculate total risk scores and create risk users list
        const highRiskUsers = Array.from(userMap.entries())
          .map(([user, data]) => {
            const riskScore = calculateRiskScore(data.fileAccess, data.logon, data.network);
            return {
              user,
              riskScore,
              reason: data.reason || "Multiple suspicious activities"
            };
          })
          .filter(user => user.riskScore > 0.5) // Only include medium-high risk users
          .sort((a, b) => b.riskScore - a.riskScore);
        
        setRiskUsers(highRiskUsers);
        
        // Generate investigations from high risk users
        const generatedInvestigations: Investigation[] = highRiskUsers
          .slice(0, 5) // Take top 5 highest risk users
          .map((user, index) => ({
            id: `INV-${Date.now()}-${index}`,
            user: user.user,
            date: new Date().toISOString().split('T')[0],
            status: index % 3 === 0 ? 'completed' : index % 3 === 1 ? 'ongoing' : 'scheduled',
            riskScore: user.riskScore,
            reason: user.reason,
            analyst: "Security Analyst"
          }));
        
        setInvestigations(generatedInvestigations);
        
      } catch (error) {
        console.error("Error loading logs:", error);
      }
    };
    
    loadLogs();
  }, []);

  const handleOpenInvestigation = (user: string) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getFilteredInvestigations = () => {
    let filtered = [...investigations];
    
    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeTab !== "all") {
      filtered = filtered.filter(inv => {
        if (activeTab === "active") return inv.status === "ongoing";
        if (activeTab === "completed") return inv.status === "completed";
        if (activeTab === "scheduled") return inv.status === "scheduled";
        return true;
      });
    }
    
    return filtered;
  };

  const filteredInvestigations = getFilteredInvestigations();

  return (
    <>
      <Helmet>
        <title>Investigations | AnomalyGuard</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Investigations</h1>
            <Button>New Investigation</Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>User Investigations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search investigations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                    prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                  />
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvestigations.length > 0 ? (
                          filteredInvestigations.map((investigation) => (
                            <TableRow key={investigation.id}>
                              <TableCell className="font-mono text-xs">{investigation.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {investigation.user.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {investigation.user}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {investigation.date}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  investigation.status === "ongoing" ? "default" :
                                  investigation.status === "completed" ? "outline" :
                                  "secondary"
                                }>
                                  {investigation.status.charAt(0).toUpperCase() + investigation.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <div className={`h-2.5 w-2.5 rounded-full 
                                    ${investigation.riskScore > 0.8 ? "bg-red-500" : 
                                      investigation.riskScore > 0.5 ? "bg-amber-500" : 
                                      "bg-green-500"}`}
                                  />
                                  <span className={
                                    investigation.riskScore > 0.8 ? "text-red-500" :
                                    investigation.riskScore > 0.5 ? "text-amber-500" :
                                    "text-green-500"
                                  }>
                                    {Math.round(investigation.riskScore * 100)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-muted-foreground">
                                {investigation.reason}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleOpenInvestigation(investigation.user)}
                                >
                                  View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="h-8 w-8 mb-2" />
                                <p>No investigations found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                High Risk Users Requiring Investigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Reason for Investigation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskUsers.length > 0 ? (
                    riskUsers.map((user, index) => (
                      <TableRow key={`risk-user-${index}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {user.user.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {user.user}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2.5 w-2.5 rounded-full 
                              ${user.riskScore > 0.8 ? "bg-red-500" : 
                                user.riskScore > 0.5 ? "bg-amber-500" : 
                                "bg-green-500"}`}
                            />
                            <span className={
                              user.riskScore > 0.8 ? "text-red-500" :
                              user.riskScore > 0.5 ? "text-amber-500" :
                              "text-green-500"
                            }>
                              {Math.round(user.riskScore * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{user.reason}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleOpenInvestigation(user.user)}
                          >
                            Investigate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          {/* <Shield className="h-8 w-8 mb-2" /> */}
                          <p>No high risk users detected</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      
      {isModalOpen && selectedUser && (
        <UserInvestigationModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          username={selectedUser}
        />
      )}
    </>
  );
};

export default InvestigationPage;
