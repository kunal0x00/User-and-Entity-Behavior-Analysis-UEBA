import React, { useState, useEffect } from "react";
import { BarChart2, FileText, Shield, ShieldAlert, User, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import AnomalyTrend from "@/components/dashboard/AnomalyTrend";
import AnomalyScoreGauge from "@/components/dashboard/AnomalyScoreGauge";
import AlertList from "@/components/dashboard/AlertList";
import FirewallLogsTable from "@/components/dashboard/FirewallLogsTable";
import NetworkActivityGraph from "@/components/dashboard/NetworkActivityGraph";
import UserRiskScoreCard from "@/components/dashboard/UserRiskScoreCard";
import LogFileUploader from "@/components/dashboard/LogFileUploader";
import FileAccessVisualization from "@/components/dashboard/FileAccessVisualization";
import LogonActivityVisualization from "@/components/dashboard/LogonActivityVisualization";
import NetworkActivityVisualization from "@/components/dashboard/NetworkActivityVisualization";
import { useNavigate } from "react-router-dom";
import { 
  alertsData, 
  dashboardStats, 
  failedLoginData, 
  fileAccessData, 
  loginActivityData,
  firewallLogs,
  networkActivityData
} from "@/services/mockData";
import { fetchLogs } from "@/services/logService";
import { FileAccessLog, LogonActivityLog, NetworkActivityLog } from "@/services/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasFileAccess, setHasFileAccess] = useState(false);
  const [hasLogonActivity, setHasLogonActivity] = useState(false);
  const [hasNetworkActivity, setHasNetworkActivity] = useState(false);
  const [fileAccessLogs, setFileAccessLogs] = useState<FileAccessLog[]>([]);
  const [logonActivityLogs, setLogonActivityLogs] = useState<LogonActivityLog[]>([]);
  const [networkActivityLogs, setNetworkActivityLogs] = useState<NetworkActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayAnomalies: 0,
    totalAnomalies: 0,
    highRiskUsers: 0,
    mediumRiskUsers: 0,
    lowRiskUsers: 0,
    averageRiskScore: 0
  });

  const handleViewAllAlerts = () => {
    navigate("/alerts");
  };

  const handleLogsProcessed = (fileAccessCount: number, logonActivityCount: number, networkActivityCount: number) => {
    setHasFileAccess(fileAccessCount > 0);
    setHasLogonActivity(logonActivityCount > 0);
    setHasNetworkActivity(networkActivityCount > 0);
  };

  // Calculate stats based on real-time log data
  const calculateStats = (
    fileAccessLogs: FileAccessLog[],
    logonActivityLogs: LogonActivityLog[],
    networkActivityLogs: NetworkActivityLog[]
  ) => {
    const uniqueUsers = new Set<string>();
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let anomalyCount = 0;
    
    // Count unique users and risk levels from file access logs
    fileAccessLogs.forEach(log => {
      const hostname = log.Details.Hostname;
      uniqueUsers.add(hostname);
      
      if (log.RiskLevel === "High" || log.RiskLevel === "Critical") {
        highRiskCount++;
      } else if (log.RiskLevel === "Medium") {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
    });
    
    // Count unique users and risk levels from logon activity logs
    logonActivityLogs.forEach(log => {
      const hostname = log.Details.Hostname;
      uniqueUsers.add(hostname);
      
      if (log.RiskLevel === "High" || log.RiskLevel === "Critical") {
        highRiskCount++;
      } else if (log.RiskLevel === "Medium") {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
      
      // Count anomalies based on failed logins or account lockouts
      if ((log.Details["No. of Failed Login Attempts"] || 0) > 0 || 
          (log.Details["No. of Account Lockout Attempts"] || 0) > 0) {
        anomalyCount++;
      }
    });
    
    // Count unique users and risk levels from network activity logs
    networkActivityLogs.forEach(log => {
      const user = log.Details.user;
      uniqueUsers.add(user);
      
      if (log.RiskLevel === "High" || log.RiskLevel === "Critical") {
        highRiskCount++;
      } else if (log.RiskLevel === "Medium") {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
      
      // Count anomalies based on large data transfers
      if ((log.Details.sentbyte || 0) > 100000 || 
          (log.Details.rcvdbyte || 0) > 100000) {
        anomalyCount++;
      }
    });
    
    const totalUsers = uniqueUsers.size;
    const totalEntities = highRiskCount + mediumRiskCount + lowRiskCount || 1;
    const averageRiskScore = (highRiskCount * 0.9 + mediumRiskCount * 0.5 + lowRiskCount * 0.1) / totalEntities;
    
    return {
      totalUsers: totalUsers || dashboardStats.totalUsers,
      activeUsers: Math.floor(totalUsers * 0.8) || dashboardStats.activeUsers,
      todayAnomalies: anomalyCount || dashboardStats.todayAnomalies,
      totalAnomalies: anomalyCount + Math.floor(anomalyCount * 1.5) || dashboardStats.totalAnomalies,
      highRiskUsers: Math.min(highRiskCount, totalUsers) || dashboardStats.highRiskUsers,
      mediumRiskUsers: Math.min(mediumRiskCount, totalUsers) || dashboardStats.mediumRiskUsers,
      lowRiskUsers: Math.max(totalUsers - highRiskCount - mediumRiskCount, 0) || dashboardStats.lowRiskUsers,
      averageRiskScore: averageRiskScore || dashboardStats.averageRiskScore
    };
  };

  // Process logs to generate data for the NetworkActivityGraph component
  const processNetworkActivityData = (logs: NetworkActivityLog[]) => {
    if (!logs.length) return networkActivityData;
    
    // Group logs by time (hour) and sum the sent/received bytes
    const byHour = logs.reduce((acc: Record<string, { sentBytes: number, receivedBytes: number, anomalyScore: number }>, log) => {
      // Extract hour from the time string
      const hour = log.Details.time.split(':')[0] || '00';
      const timeKey = `${hour}:00`;
      
      if (!acc[timeKey]) {
        acc[timeKey] = { sentBytes: 0, receivedBytes: 0, anomalyScore: 0 };
      }
      
      acc[timeKey].sentBytes += log.Details.sentbyte || 0;
      acc[timeKey].receivedBytes += log.Details.rcvdbyte || 0;
      
      // Calculate anomaly score based on volume
      const totalBytes = (log.Details.sentbyte || 0) + (log.Details.rcvdbyte || 0);
      if (totalBytes > 100000) {
        acc[timeKey].anomalyScore = Math.max(acc[timeKey].anomalyScore, 0.8);
      } else if (totalBytes > 50000) {
        acc[timeKey].anomalyScore = Math.max(acc[timeKey].anomalyScore, 0.5);
      }
      
      return acc;
    }, {});
    
    // Convert to array sorted by hour
    return Object.entries(byHour)
      .map(([timestamp, data]) => ({
        timestamp,
        sentBytes: data.sentBytes,
        receivedBytes: data.receivedBytes,
        anomalyScore: data.anomalyScore
      }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  };
  
  // Process logs to generate data for UserRiskScore
  const processUserRiskData = (
    fileAccessLogs: FileAccessLog[],
    logonActivityLogs: LogonActivityLog[],
    networkActivityLogs: NetworkActivityLog[]
  ) => {
    const userRiskMap = new Map<string, { riskScore: number, count: number }>();
    
    // Combine all logs to get a comprehensive view of all users
    fileAccessLogs.forEach(log => {
      const user = log.Details.Hostname;
      const existingData = userRiskMap.get(user) || { riskScore: 0, count: 0 };
      let riskScore = 0;
      
      if (log.RiskLevel === "Critical") riskScore = 1;
      else if (log.RiskLevel === "High") riskScore = 0.8;
      else if (log.RiskLevel === "Medium") riskScore = 0.5;
      else riskScore = 0.2;
      
      userRiskMap.set(user, {
        riskScore: existingData.riskScore + riskScore,
        count: existingData.count + 1
      });
    });
    
    logonActivityLogs.forEach(log => {
      const user = log.Details.Hostname;
      const existingData = userRiskMap.get(user) || { riskScore: 0, count: 0 };
      let riskScore = 0;
      
      if (log.RiskLevel === "Critical") riskScore = 1;
      else if (log.RiskLevel === "High") riskScore = 0.8;
      else if (log.RiskLevel === "Medium") riskScore = 0.5;
      else riskScore = 0.2;
      
      // Increase risk score for failed login attempts or account lockouts
      if ((log.Details["No. of Failed Login Attempts"] || 0) > 0) {
        riskScore += 0.2;
      }
      
      if ((log.Details["No. of Account Lockout Attempts"] || 0) > 0) {
        riskScore += 0.4;
      }
      
      userRiskMap.set(user, {
        riskScore: existingData.riskScore + riskScore,
        count: existingData.count + 1
      });
    });
    
    networkActivityLogs.forEach(log => {
      const user = log.Details.user;
      const existingData = userRiskMap.get(user) || { riskScore: 0, count: 0 };
      let riskScore = 0;
      
      if (log.RiskLevel === "Critical") riskScore = 1;
      else if (log.RiskLevel === "High") riskScore = 0.8;
      else if (log.RiskLevel === "Medium") riskScore = 0.5;
      else riskScore = 0.2;
      
      // Increase risk score for large data transfers
      if ((log.Details.sentbyte || 0) > 100000 || (log.Details.rcvdbyte || 0) > 100000) {
        riskScore += 0.3;
      }
      
      userRiskMap.set(user, {
        riskScore: existingData.riskScore + riskScore,
        count: existingData.count + 1
      });
    });
    
    // Calculate average risk score for each user and format for the component
    return Array.from(userRiskMap.entries())
      .map(([name, data]) => ({
        id: name,
        name,
        department: "Unknown", // We don't have department info in the logs
        riskScore: Math.min(data.riskScore / (data.count || 1), 1), // Normalize between 0 and 1
        trend: Math.random() * 0.4 - 0.2 // Random trend for demonstration
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  };

  // Fetch logs on component mount
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const logs = await fetchLogs();
        setFileAccessLogs(logs.fileAccessLogs);
        setLogonActivityLogs(logs.logonActivityLogs);
        setNetworkActivityLogs(logs.networkActivityLogs);
        
        setHasFileAccess(logs.fileAccessLogs.length > 0);
        setHasLogonActivity(logs.logonActivityLogs.length > 0);
        setHasNetworkActivity(logs.networkActivityLogs.length > 0);
        
        // Update stats based on the fetched logs
        setStats(calculateStats(logs.fileAccessLogs, logs.logonActivityLogs, logs.networkActivityLogs));
      } catch (error) {
        console.error("Error loading logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLogs();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(loadLogs, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, []);

  const realTimeNetworkData = processNetworkActivityData(networkActivityLogs);
  const userRiskData = processUserRiskData(fileAccessLogs, logonActivityLogs, networkActivityLogs);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor user behavior and security anomalies</p>
        </div>
      </div>

      {/* Log Data Fetcher */}
      <div className="mb-6">
        <LogFileUploader 
          onLogsProcessed={(fileAccessCount, logonActivityCount, networkActivityCount) => {
            handleLogsProcessed(fileAccessCount, logonActivityCount, networkActivityCount);
            // Refresh logs after processing
            fetchLogs().then(logs => {
              setFileAccessLogs(logs.fileAccessLogs);
              setLogonActivityLogs(logs.logonActivityLogs);
              setNetworkActivityLogs(logs.networkActivityLogs);
              setStats(calculateStats(logs.fileAccessLogs, logs.logonActivityLogs, logs.networkActivityLogs));
            });
          }} 
        />
      </div>

      {/* Fetched Log Data Visualizations - UPDATED: Two visualizations per row */}
      {(hasFileAccess || hasLogonActivity || hasNetworkActivity) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {hasFileAccess && fileAccessLogs.length > 0 && (
            <FileAccessVisualization logs={fileAccessLogs} className="h-auto" />
          )}
          
          {hasLogonActivity && logonActivityLogs.length > 0 && (
            <LogonActivityVisualization logs={logonActivityLogs} className="h-auto" />
          )}
          
          {hasNetworkActivity && networkActivityLogs.length > 0 && (
            <NetworkActivityVisualization logs={networkActivityLogs} className="h-auto" />
          )}
          
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Monitored Users"
          value={stats.totalUsers}
          icon={<Users size={20} />}
          description={`${stats.activeUsers} currently active`}
        />
        <StatCard
          title="Anomalies Today"
          value={stats.todayAnomalies}
          icon={<ShieldAlert size={20} />}
          description={`${stats.totalAnomalies} this week`}
          trend={22}
          trendLabel="vs. yesterday"
          variant="anomaly"
        />
        <StatCard
          title="High Risk Users"
          value={stats.highRiskUsers}
          icon={<Shield size={20} />}
          description={`${stats.mediumRiskUsers} medium risk, ${stats.lowRiskUsers} low risk`}
        />
        <StatCard
          title="Avg. Risk Score"
          value={`${Math.round(stats.averageRiskScore * 100)}%`}
          icon={<BarChart2 size={20} />}
          description="Across all users"
          trend={-5}
          trendLabel="vs. last week"
        />
      </div>

      {/* Charts row - User Login and Failed Login Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnomalyTrend
          title="Login Activity"
          description="Number of logins over time with anomaly score"
          data={logonActivityLogs.length > 0 
            ? logonActivityLogs.map(log => ({
                name: `${log.Details.Date || 'Unknown'} - ${log.Details.Hostname}`,
                value: log.Details["No. of Logins"] || 0,
                anomalyScore: ((log.Details["No. of Failed Login Attempts"] || 0) > 0) ? 0.8 : 0.2
              }))
            : loginActivityData
          }
        />
        <AnomalyTrend
          title="Failed Login Attempts"
          description="Failed login attempts with anomaly detection"
          data={logonActivityLogs.length > 0
            ? logonActivityLogs
                .filter(log => (log.Details["No. of Failed Login Attempts"] || 0) > 0)
                .map(log => ({
                  name: `${log.Details.Date || 'Unknown'} - ${log.Details.Hostname}`,
                  value: log.Details["No. of Failed Login Attempts"] || 0,
                  anomalyScore: (log.Details["No. of Failed Login Attempts"] || 0) > 3 ? 0.9 : 0.6
                }))
            : failedLoginData
          }
          gradientFrom="rgba(239, 68, 68, 0.2)"
          gradientTo="rgba(239, 68, 68, 0)"
        />
      </div>

      {/* Network Activity Graph and User Risk Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <NetworkActivityGraph
          title="Network Traffic Analysis"
          description="Sent and received bytes with anomaly detection"
          data={realTimeNetworkData.length > 0 ? realTimeNetworkData : networkActivityData}
        />
        <UserRiskScoreCard 
          users={userRiskData.length > 0 ? userRiskData : []} 
        />
      </div>

      {/* Firewall Logs Table */}
      <div className="mb-6">
        <FirewallLogsTable logs={firewallLogs} />
      </div>

      {/* Alerts and System Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AlertList 
            alerts={alertsData
              .filter(alert => alert.severity !== "critical" || alert.severity === "critical")
              .map(alert => ({
                id: alert.id,
                title: alert.title,
                description: alert.description,
                timestamp: alert.timestamp,
                severity: alert.severity,
                entity: alert.entity,
                status: alert.status
              }))} 
            onViewAll={handleViewAllAlerts}
          />
        </div>
        <div>
          <AnomalyScoreGauge
            title="Overall System Risk"
            description="Current threat assessment based on all anomalies"
            value={stats.averageRiskScore}
          />
        </div>
      </div>

      {/* File Access Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-3">
          <AnomalyTrend
            title="File Access Activity"
            description="File access operations with anomaly detection"
            data={fileAccessLogs.length > 0
              ? fileAccessLogs.map(log => ({
                  name: `${log.Details.Date || 'Unknown'} - ${log.Details.Hostname}`,
                  value: log.Details["Number of Files Accessed"] || 0,
                  anomalyScore: log.Details["Number of Files Accessed"] > 20 ? 0.8 : 0.3
                }))
              : fileAccessData
            }
            gradientFrom="rgba(16, 185, 129, 0.2)"
            gradientTo="rgba(16, 185, 129, 0)"
            height={250}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
