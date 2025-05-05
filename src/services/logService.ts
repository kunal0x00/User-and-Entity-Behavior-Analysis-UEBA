
import { 
  FileAccessLog, 
  LogonActivityLog, 
  NetworkActivityLog 
} from './mockData';

// Configuration for log server connection
export const logServerConfig = {
  ip: "localhost", // Default to localhost for development
  port: 8081,      // Default port from user requirements
};

// Utility to get the full server URL
export const getLogServerUrl = () => {
  return `http://${logServerConfig.ip}:${logServerConfig.port}`;
};

// Risk levels for different hosts and users (simulating Risk.txt)
const riskLevels = {
  "User1": "Low",
  "User2": "Medium", 
  "User3": "Low",
  "Admin1": "High",
  "Yeti": "Low",
  "Wolf": "Medium",
  "Bear": "Low",
  "Fox": "High",
  "user1": "Low",
  "user2": "Medium",
  "user3": "Low",
  "admin1": "Critical",
  "Krak": "High",
  "jugnu": "Medium",
  "KunalG": "High"
};

// Risk calculation based on provided formula
export function calculateRiskScore(fileAccessScore: number, logonActivityScore: number, networkActivityScore: number): number {
  const s1 = fileAccessScore || 0;
  const s2 = logonActivityScore || 0;
  const s3 = networkActivityScore || 0;
  
  // Risk_Score = 38.36454020555577*s1[-0.03249382] + s2[0.05180103] + s3[0.18216909]
  let score = 38.36454020555577 * Math.pow(s1, -0.03249382);
  score += Math.pow(s2, 0.05180103);
  score += Math.pow(s3, 0.18216909);
  
  // Normalize to 0-1 range
  return Math.min(Math.max(score / 50, 0), 1);
}

// Calculate risk score components for each type of activity
export function calculateFileAccessRiskScore(logEntry: FileAccessLog): number {
  const fileCount = logEntry.Details["Number of Files Accessed"] || 0;
  // Higher file access counts lead to higher risk
  return Math.min(fileCount / 30, 1); // Normalize to 0-1, with 30+ files being max risk
}

export function calculateLogonRiskScore(logEntry: LogonActivityLog): number {
  const failedLogins = logEntry.Details["No. of Failed Login Attempts"] || 0;
  const accountLockouts = logEntry.Details["No. of Account Lockout Attempts"] || 0;
  
  // Failed logins and lockouts heavily increase risk
  return Math.min((failedLogins * 0.2) + (accountLockouts * 0.6), 1);
}

export function calculateNetworkRiskScore(logEntry: NetworkActivityLog): number {
  const sentBytes = logEntry.Details.sentbyte || 0;
  const rcvdBytes = logEntry.Details.rcvdbyte || 0;
  const totalBytes = sentBytes + rcvdBytes;
  
  // Large data transfers indicate higher risk
  return Math.min(totalBytes / 200000, 1); // 200KB+ is max risk
}

// Convert the raw logs to the format expected by our application
function convertFileAccessLogs(rawLogs: any[]): FileAccessLog[] {
  return rawLogs.map(log => ({
    Type: "File Access",
    Details: {
      Hostname: log.Hostname,
      Date: log.Date || "",
      "Time Period": log.Time_Period,
      Day: log.Day,
      "Number of Files Accessed": log.Number_of_Files_Accessed
    },
    RiskLevel: riskLevels[log.Hostname] || "Low"
  }));
}

function convertLogonActivityLogs(rawLogs: any[]): LogonActivityLog[] {
  return rawLogs.map(log => ({
    Type: "Logon Activity",
    Details: {
      Hostname: log.Hostname,
      Date: log.Date,
      "Time Period": log.Time_Period,
      Day: log.Day,
      "No. of Logins": log.No_of_Logins || log["No._of_Logins"], 
      "No. of Logouts": log.No_of_Logouts || log["No._of_Logouts"],
      "No. of Failed Login Attempts": log.No_of_Failed_Login_Attempts || log["No._of_Failed_Login_Attempts"],
      "No. of Account Lockout Attempts": log.No_of_Account_Lockout_Attempts || log["No._of_Account_Lockout_Attempts"]
    },
    RiskLevel: riskLevels[log.Hostname] || "Low"
  }));
}

function convertNetworkActivityLogs(rawLogs: any[]): NetworkActivityLog[] {
  return rawLogs.map(log => ({
    Type: "Network Activity",
    Details: {
      date: log.date,
      time: log.time,
      user: log.user,
      dstport: log.dstport,
      duration: log.duration,
      sentbyte: log.sentbyte,
      rcvdbyte: log.rcvdbyte,
      sentpkt: log.sentpkt,
      rcvdpkt: log.rcvdpkt
    },
    RiskLevel: riskLevels[log.user] || "Low"
  }));
}

async function fetchNDJSON(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      return []; // Return empty array for empty responses
    }
    
    const lines = text.trim().split('\n');
    return lines.map(line => JSON.parse(line));
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    // Return mock data if fetching fails
    if (url.includes('File_acess_log.ndjson')) {
      return [
        {"Hostname": "User1", "Date": "2025-05-02", "Time_Period": 3, "Day": 5, "Number_of_Files_Accessed": 9},
        {"Hostname": "User2", "Date": "2025-05-02", "Time_Period": 2, "Day": 3, "Number_of_Files_Accessed": 15},
        {"Hostname": "Admin1", "Date": "2025-05-02", "Time_Period": 4, "Day": 1, "Number_of_Files_Accessed": 27},
        {"Hostname": "User3", "Date": "2025-05-02", "Time_Period": 1, "Day": 4, "Number_of_Files_Accessed": 3},
      ];
    } else if (url.includes('Login_event_log.ndjson')) {
      return [
        {"Hostname": "Yeti", "Date": "2025-05-02", "Time_Period": 1, "Day": 5, "No_of_Logins": 31, "No_of_Logouts": 2, "No_of_Failed_Login_Attempts": 0, "No_of_Account_Lockout_Attempts": 0},
        {"Hostname": "Wolf", "Date": "2025-05-02", "Time_Period": 2, "Day": 5, "No_of_Logins": 12, "No_of_Logouts": 10, "No_of_Failed_Login_Attempts": 3, "No_of_Account_Lockout_Attempts": 0},
        {"Hostname": "Bear", "Date": "2025-05-02", "Time_Period": 3, "Day": 6, "No_of_Logins": 5, "No_of_Logouts": 5, "No_of_Failed_Login_Attempts": 0, "No_of_Account_Lockout_Attempts": 0},
        {"Hostname": "Fox", "Date": "2025-05-02", "Time_Period": 4, "Day": 6, "No_of_Logins": 8, "No_of_Logouts": 8, "No_of_Failed_Login_Attempts": 7, "No_of_Account_Lockout_Attempts": 1},
      ];
    } else {
      return [
        {"date": "2025-05-02", "time": "17:30:23", "user": "user1", "dstport": 443, "duration": 131, "sentbyte": 2517, "rcvdbyte": 7529, "sentpkt": 8, "rcvdpkt": 10},
        {"date": "2025-05-02", "time": "17:31:45", "user": "user2", "dstport": 80, "duration": 95, "sentbyte": 1834, "rcvdbyte": 15420, "sentpkt": 12, "rcvdpkt": 18},
        {"date": "2025-05-02", "time": "17:33:12", "user": "admin1", "dstport": 22, "duration": 312, "sentbyte": 125670, "rcvdbyte": 4328, "sentpkt": 86, "rcvdpkt": 42},
        {"date": "2025-05-02", "time": "17:35:30", "user": "user3", "dstport": 8080, "duration": 215, "sentbyte": 3421, "rcvdbyte": 9876, "sentpkt": 24, "rcvdpkt": 36},
      ];
    }
  }
}

export async function fetchLogs() {
  const baseUrl = getLogServerUrl();
  console.log(`Fetching logs from: ${baseUrl}`);

  try {
    const [fileAccessRaw, logonActivityRaw, networkActivityRaw] = await Promise.all([
      fetchNDJSON(`${baseUrl}/File_acess_log.ndjson`),
      fetchNDJSON(`${baseUrl}/Login_event_log.ndjson`),
      fetchNDJSON(`${baseUrl}/Network_acess_log.ndjson`)
    ]);

    const fileAccessLogs = convertFileAccessLogs(fileAccessRaw);
    const logonActivityLogs = convertLogonActivityLogs(logonActivityRaw);
    const networkActivityLogs = convertNetworkActivityLogs(networkActivityRaw);

    return {
      fileAccessLogs,
      logonActivityLogs,
      networkActivityLogs
    };
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}
