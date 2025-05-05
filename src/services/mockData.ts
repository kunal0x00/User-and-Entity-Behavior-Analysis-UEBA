
// Using Date object instead of faker for dates
const getRandomDate = () => {
  const start = new Date('2025-01-01');
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Using simple methods instead of faker
const getRandomUserName = () => {
  const names = ["Alice Johnson", "Bob Williams", "Charlie Brown", "Diana Miller", "Ethan Davis", "Fiona White", "George Black", "Hannah Green", "Isaac Blue", "Julia Red"];
  return names[Math.floor(Math.random() * names.length)];
};

const getRandomEmail = (name: string) => {
  const namePart = name.toLowerCase().replace(' ', '.');
  const domains = ["example.com", "mail.com", "company.org", "service.net"];
  return `${namePart}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const getRandomIP = () => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
};

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayAnomalies: number;
  totalAnomalies: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
  averageRiskScore: number;
}

export interface AnomalyTrendData {
  timestamp: string;
  value: number;
  anomalyScore?: number;
}

export interface ActivityHeatmapData {
  hour: string;
  day: string;
  value: number;
}

export interface UserRiskData {
  id: string;
  name: string;
  riskScore: number;
  department?: string;
  trend?: number;
}

export interface EnhancedUserRiskData extends UserRiskData {
  email: string;
  anomalies: number;
  lastActive: Date;
  status: string;
  riskFactors?: {
    category: string;
    value: number;
  }[];
}

export interface Alert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entity: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
}

export interface AlertData extends Alert {
  user: string;
  activity: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
}

export interface FirewallLog {
  date: string;
  time: string;
  user: string;
  srcip: string;
  dstip: string;
  dstport: number;
  protocol: string;
  duration: number;
  sentbyte: number;
  rcvdbyte: number;
  sentpkt: number;
  rcvdpkt: number;
  flag: string;
  tos: string;
}

export interface NetworkActivityData {
  timestamp: string;
  sentBytes: number;
  receivedBytes: number;
  anomalyScore?: number;
}

// Update the type definitions to include risk level
export interface FileAccessLog {
  Type: string;
  Details: {
    Hostname: string;
    Date: string;
    "Time Period": number;
    Day: number;
    "Number of Files Accessed": number;
  };
  RiskLevel?: string;
}

export interface LogonActivityLog {
  Type: string;
  Details: {
    Hostname: string;
    Date: string;
    "Time Period": number;
    Day: number;
    "No. of Logins": number;
    "No. of Logouts": number;
    "No. of Failed Login Attempts": number;
    "No. of Account Lockout Attempts": number;
  };
  RiskLevel?: string;
}

export interface NetworkActivityLog {
  Type: string;
  Details: {
    date: string;
    time: string;
    user: string;
    dstport: number;
    duration: number;
    sentbyte: number;
    rcvdbyte: number;
    sentpkt: number;
    rcvdpkt: number;
  };
  RiskLevel?: string;
}

export const dashboardStats: DashboardStats = {
  totalUsers: 245,
  activeUsers: 187,
  todayAnomalies: 12,
  totalAnomalies: 85,
  highRiskUsers: 5,
  mediumRiskUsers: 18,
  lowRiskUsers: 222,
  averageRiskScore: 0.28,
};

export const loginActivityData: AnomalyTrendData[] = [
  { timestamp: '00:00', value: 120, anomalyScore: 0.1 },
  { timestamp: '01:00', value: 90, anomalyScore: 0.05 },
  { timestamp: '02:00', value: 80, anomalyScore: 0.03 },
  { timestamp: '03:00', value: 75, anomalyScore: 0.02 },
  { timestamp: '04:00', value: 82, anomalyScore: 0.04 },
  { timestamp: '05:00', value: 110, anomalyScore: 0.07 },
  { timestamp: '06:00', value: 220, anomalyScore: 0.2 },
  { timestamp: '07:00', value: 350, anomalyScore: 0.3 },
  { timestamp: '08:00', value: 420, anomalyScore: 0.35 },
  { timestamp: '09:00', value: 380, anomalyScore: 0.32 },
  { timestamp: '10:00', value: 390, anomalyScore: 0.33 },
  { timestamp: '11:00', value: 410, anomalyScore: 0.34 },
  { timestamp: '12:00', value: 450, anomalyScore: 0.38 },
  { timestamp: '13:00', value: 430, anomalyScore: 0.36 },
  { timestamp: '14:00', value: 400, anomalyScore: 0.33 },
  { timestamp: '15:00', value: 370, anomalyScore: 0.3 },
  { timestamp: '16:00', value: 390, anomalyScore: 0.32 },
  { timestamp: '17:00', value: 410, anomalyScore: 0.34 },
  { timestamp: '18:00', value: 380, anomalyScore: 0.31 },
  { timestamp: '19:00', value: 350, anomalyScore: 0.28 },
  { timestamp: '20:00', value: 300, anomalyScore: 0.25 },
  { timestamp: '21:00', value: 250, anomalyScore: 0.2 },
  { timestamp: '22:00', value: 180, anomalyScore: 0.15 },
  { timestamp: '23:00', value: 150, anomalyScore: 0.12 },
];

export const failedLoginData: AnomalyTrendData[] = [
  { timestamp: '00:00', value: 5, anomalyScore: 0.01 },
  { timestamp: '01:00', value: 3, anomalyScore: 0.01 },
  { timestamp: '02:00', value: 2, anomalyScore: 0.01 },
  { timestamp: '03:00', value: 1, anomalyScore: 0.01 },
  { timestamp: '04:00', value: 2, anomalyScore: 0.01 },
  { timestamp: '05:00', value: 4, anomalyScore: 0.02 },
  { timestamp: '06:00', value: 8, anomalyScore: 0.05 },
  { timestamp: '07:00', value: 15, anomalyScore: 0.1 },
  { timestamp: '08:00', value: 7, anomalyScore: 0.04 },
  { timestamp: '09:00', value: 3, anomalyScore: 0.02 },
  { timestamp: '10:00', value: 2, anomalyScore: 0.01 },
  { timestamp: '11:00', value: 1, anomalyScore: 0.01 },
  { timestamp: '12:00', value: 3, anomalyScore: 0.02 },
  { timestamp: '13:00', value: 5, anomalyScore: 0.03 },
  { timestamp: '14:00', value: 4, anomalyScore: 0.02 },
  { timestamp: '15:00', value: 2, anomalyScore: 0.01 },
  { timestamp: '16:00', value: 3, anomalyScore: 0.02 },
  { timestamp: '17:00', value: 6, anomalyScore: 0.04 },
  { timestamp: '18:00', value: 4, anomalyScore: 0.02 },
  { timestamp: '19:00', value: 2, anomalyScore: 0.01 },
  { timestamp: '20:00', value: 1, anomalyScore: 0.01 },
  { timestamp: '21:00', value: 3, anomalyScore: 0.02 },
  { timestamp: '22:00', value: 6, anomalyScore: 0.04 },
  { timestamp: '23:00', value: 4, anomalyScore: 0.02 },
];

export const fileAccessData: AnomalyTrendData[] = [
  { timestamp: '00:00', value: 30, anomalyScore: 0.01 },
  { timestamp: '01:00', value: 25, anomalyScore: 0.01 },
  { timestamp: '02:00', value: 20, anomalyScore: 0.01 },
  { timestamp: '03:00', value: 15, anomalyScore: 0.01 },
  { timestamp: '04:00', value: 18, anomalyScore: 0.01 },
  { timestamp: '05:00', value: 35, anomalyScore: 0.02 },
  { timestamp: '06:00', value: 70, anomalyScore: 0.05 },
  { timestamp: '07:00', value: 120, anomalyScore: 0.1 },
  { timestamp: '08:00', value: 150, anomalyScore: 0.12 },
  { timestamp: '09:00', value: 130, anomalyScore: 0.1 },
  { timestamp: '10:00', value: 140, anomalyScore: 0.11 },
  { timestamp: '11:00', value: 160, anomalyScore: 0.13 },
  { timestamp: '12:00', value: 180, anomalyScore: 0.15 },
  { timestamp: '13:00', value: 170, anomalyScore: 0.14 },
  { timestamp: '14:00', value: 150, anomalyScore: 0.12 },
  { timestamp: '15:00', value: 130, anomalyScore: 0.1 },
  { timestamp: '16:00', value: 140, anomalyScore: 0.11 },
  { timestamp: '17:00', value: 160, anomalyScore: 0.13 },
  { timestamp: '18:00', value: 140, anomalyScore: 0.11 },
  { timestamp: '19:00', value: 120, anomalyScore: 0.1 },
  { timestamp: '20:00', value: 90, anomalyScore: 0.07 },
  { timestamp: '21:00', value: 70, anomalyScore: 0.05 },
  { timestamp: '22:00', value: 50, anomalyScore: 0.03 },
  { timestamp: '23:00', value: 40, anomalyScore: 0.02 },
];

export const hoursLabels = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00', '23:00'
];

export const daysLabels = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const loginHeatmapData: ActivityHeatmapData[] = [];

// Generate heatmap data
for (const day of daysLabels) {
  for (const hour of hoursLabels) {
    const value = Math.floor(Math.random() * 20); // Generate a random value for each cell
    loginHeatmapData.push({ day: day, hour: hour, value: value });
  }
}

export const userRiskData: UserRiskData[] = [
  { id: 'user1', name: 'Alice Johnson', riskScore: 0.15, department: 'IT', trend: 0 },
  { id: 'user2', name: 'Bob Williams', riskScore: 0.45, department: 'Finance', trend: 5 },
  { id: 'user3', name: 'Charlie Brown', riskScore: 0.75, department: 'HR', trend: -2 },
  { id: 'user4', name: 'Diana Miller', riskScore: 0.25, department: 'Marketing', trend: 1 },
  { id: 'user5', name: 'Ethan Davis', riskScore: 0.60, department: 'Sales', trend: 3 },
];

// Add example risk factors for users
const exampleRiskFactors = [
  { category: "Failed Logins", value: 0.65 },
  { category: "Unusual Time", value: 0.42 },
  { category: "New Location", value: 0.38 },
  { category: "Data Access", value: 0.71 },
  { category: "Admin Actions", value: 0.45 }
];

export const enhancedUserRiskData: EnhancedUserRiskData[] = [
  { id: 'user1', name: 'Alice Johnson', email: 'alice.johnson@example.com', riskScore: 0.15, anomalies: 0, lastActive: new Date(Date.now() - 1000 * 60 * 15), status: 'online', department: 'IT', trend: 0, riskFactors: exampleRiskFactors },
  { id: 'user2', name: 'Bob Williams', email: 'bob.williams@example.com', riskScore: 0.45, anomalies: 2, lastActive: new Date(Date.now() - 1000 * 60 * 120), status: 'offline', department: 'Finance', trend: 5, riskFactors: exampleRiskFactors },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie.brown@example.com', riskScore: 0.75, anomalies: 5, lastActive: new Date(Date.now() - 1000 * 60 * 30), status: 'online', department: 'HR', trend: -2, riskFactors: exampleRiskFactors },
  { id: 'user4', name: 'Diana Miller', email: 'diana.miller@example.com', riskScore: 0.25, anomalies: 1, lastActive: new Date(Date.now() - 1000 * 60 * 240), status: 'offline', department: 'Marketing', trend: 1, riskFactors: exampleRiskFactors },
  { id: 'user5', name: 'Ethan Davis', email: 'ethan.davis@example.com', riskScore: 0.60, anomalies: 3, lastActive: new Date(Date.now() - 1000 * 60 * 45), status: 'online', department: 'Sales', trend: 3, riskFactors: exampleRiskFactors },
  { id: 'user6', name: 'Fiona White', email: 'fiona.white@example.com', riskScore: 0.30, anomalies: 0, lastActive: new Date(Date.now() - 1000 * 60 * 75), status: 'online', department: 'Support', trend: -1, riskFactors: exampleRiskFactors },
  { id: 'user7', name: 'George Black', email: 'george.black@example.com', riskScore: 0.85, anomalies: 7, lastActive: new Date(Date.now() - 1000 * 60 * 180), status: 'offline', department: 'Engineering', trend: 4, riskFactors: exampleRiskFactors },
  { id: 'user8', name: 'Hannah Green', email: 'hannah.green@example.com', riskScore: 0.50, anomalies: 2, lastActive: new Date(Date.now() - 1000 * 60 * 60), status: 'online', department: 'Product', trend: 2, riskFactors: exampleRiskFactors },
  { id: 'user9', name: 'Isaac Blue', email: 'isaac.blue@example.com', riskScore: 0.20, anomalies: 0, lastActive: new Date(Date.now() - 1000 * 60 * 320), status: 'offline', department: 'Operations', trend: -3, riskFactors: exampleRiskFactors },
  { id: 'user10', name: 'Julia Red', email: 'julia.red@example.com', riskScore: 0.70, anomalies: 4, lastActive: new Date(Date.now() - 1000 * 60 * 20), status: 'online', department: 'R&D', trend: 1, riskFactors: exampleRiskFactors },
];

// Export usersData for UsersPage
export const usersData = enhancedUserRiskData;

export const alertsData: Alert[] = [
  {
    id: 'alert1',
    timestamp: new Date().toLocaleString(),
    title: 'Multiple failed login attempts',
    description: 'User Charlie Brown had 5 failed login attempts in the last hour.',
    severity: 'high',
    entity: 'Charlie Brown',
    status: 'new'
  },
  {
    id: 'alert2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(),
    title: 'Unusual file access',
    description: 'User Bob Williams accessed a sensitive file outside of normal working hours.',
    severity: 'medium',
    entity: 'Bob Williams',
    status: 'investigating'
  },
  {
    id: 'alert3',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(),
    title: 'New device login',
    description: 'User Alice Johnson logged in from a new device.',
    severity: 'low',
    entity: 'Alice Johnson',
    status: 'resolved'
  },
  {
    id: 'alert4',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleString(),
    title: 'Privilege escalation',
    description: 'User Ethan Davis attempted to escalate privileges.',
    severity: 'high',
    entity: 'Ethan Davis',
    status: 'investigating'
  },
  {
    id: 'alert5',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toLocaleString(),
    title: 'Data exfiltration',
    description: 'User Diana Miller sent a large amount of data outside the network.',
    severity: 'high',
    entity: 'Diana Miller',
    status: 'new'
  },
];

export const firewallLogs: FirewallLog[] = [];

// Generate firewall log data
for (let i = 0; i < 25; i++) {
  const userName = getRandomUserName();
  firewallLogs.push({
    date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    user: userName.toLowerCase().split(' ')[0],
    srcip: getRandomIP(),
    dstip: getRandomIP(),
    dstport: Math.floor(Math.random() * 10000) + 1000,
    protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
    duration: Math.floor(Math.random() * 990) + 10,
    sentbyte: Math.floor(Math.random() * 99900) + 100,
    rcvdbyte: Math.floor(Math.random() * 99900) + 100,
    sentpkt: Math.floor(Math.random() * 99) + 1,
    rcvdpkt: Math.floor(Math.random() * 99) + 1,
    flag: Math.random() > 0.5 ? 'PSH' : 'ACK',
    tos: Math.random() > 0.5 ? 'normal' : 'low-delay',
  });
}

export const networkActivityData: NetworkActivityData[] = [
  { timestamp: '00:00', sentBytes: 50000, receivedBytes: 75000, anomalyScore: 0.1 },
  { timestamp: '01:00', sentBytes: 45000, receivedBytes: 68000, anomalyScore: 0.05 },
  { timestamp: '02:00', sentBytes: 40000, receivedBytes: 62000, anomalyScore: 0.03 },
  { timestamp: '03:00', sentBytes: 38000, receivedBytes: 58000, anomalyScore: 0.02 },
  { timestamp: '04:00', sentBytes: 42000, receivedBytes: 65000, anomalyScore: 0.04 },
  { timestamp: '05:00', sentBytes: 60000, receivedBytes: 88000, anomalyScore: 0.07 },
  { timestamp: '06:00', sentBytes: 120000, receivedBytes: 150000, anomalyScore: 0.2 },
  { timestamp: '07:00', sentBytes: 180000, receivedBytes: 220000, anomalyScore: 0.3 },
  { timestamp: '08:00', sentBytes: 220000, receivedBytes: 250000, anomalyScore: 0.35 },
  { timestamp: '09:00', sentBytes: 200000, receivedBytes: 230000, anomalyScore: 0.32 },
  { timestamp: '10:00', sentBytes: 210000, receivedBytes: 240000, anomalyScore: 0.33 },
  { timestamp: '11:00', sentBytes: 230000, receivedBytes: 260000, anomalyScore: 0.34 },
  { timestamp: '12:00', sentBytes: 250000, receivedBytes: 280000, anomalyScore: 0.38 },
  { timestamp: '13:00', sentBytes: 240000, receivedBytes: 270000, anomalyScore: 0.36 },
  { timestamp: '14:00', sentBytes: 220000, receivedBytes: 250000, anomalyScore: 0.33 },
  { timestamp: '15:00', sentBytes: 200000, receivedBytes: 230000, anomalyScore: 0.3 },
  { timestamp: '16:00', sentBytes: 210000, receivedBytes: 240000, anomalyScore: 0.32 },
  { timestamp: '17:00', sentBytes: 230000, receivedBytes: 260000, anomalyScore: 0.34 },
  { timestamp: '18:00', sentBytes: 210000, receivedBytes: 240000, anomalyScore: 0.31 },
  { timestamp: '19:00', sentBytes: 190000, receivedBytes: 220000, anomalyScore: 0.28 },
  { timestamp: '20:00', sentBytes: 160000, receivedBytes: 190000, anomalyScore: 0.25 },
  { timestamp: '21:00', sentBytes: 130000, receivedBytes: 160000, anomalyScore: 0.2 },
  { timestamp: '22:00', sentBytes: 90000, receivedBytes: 120000, anomalyScore: 0.15 },
  { timestamp: '23:00', sentBytes: 70000, receivedBytes: 100000, anomalyScore: 0.12 },
];

// Make sure we properly export uploadedLogs with risk levels included
export const uploadedFileAccessLogs: FileAccessLog[] = [
  {
    Type: "File Access",
    Details: {
      Hostname: "User1",
      Date: "",
      "Time Period": 3,
      Day: 5,
      "Number of Files Accessed": 9
    },
    RiskLevel: "Low"
  },
  {
    Type: "File Access",
    Details: {
      Hostname: "User2",
      Date: "",
      "Time Period": 2,
      Day: 3,
      "Number of Files Accessed": 15
    },
    RiskLevel: "Medium"
  },
  {
    Type: "File Access",
    Details: {
      Hostname: "Admin1",
      Date: "",
      "Time Period": 4,
      Day: 1,
      "Number of Files Accessed": 27
    },
    RiskLevel: "High"
  },
];

export const uploadedLogonActivityLogs: LogonActivityLog[] = [
  {
    Type: "Logon Activity",
    Details: {
      Hostname: "Yeti",
      Date: "3/28/2025",
      "Time Period": 1,
      Day: 5,
      "No. of Logins": 31,
      "No. of Logouts": 2,
      "No. of Failed Login Attempts": 0,
      "No. of Account Lockout Attempts": 0
    },
    RiskLevel: "Low"
  },
  {
    Type: "Logon Activity",
    Details: {
      Hostname: "Wolf",
      Date: "3/28/2025",
      "Time Period": 2,
      Day: 5,
      "No. of Logins": 12,
      "No. of Logouts": 10,
      "No. of Failed Login Attempts": 3,
      "No. of Account Lockout Attempts": 0
    },
    RiskLevel: "Medium"
  },
  {
    Type: "Logon Activity",
    Details: {
      Hostname: "Fox",
      Date: "3/29/2025",
      "Time Period": 4,
      Day: 6,
      "No. of Logins": 8,
      "No. of Logouts": 8,
      "No. of Failed Login Attempts": 7,
      "No. of Account Lockout Attempts": 1
    },
    RiskLevel: "High"
  },
];

export const uploadedNetworkActivityLogs: NetworkActivityLog[] = [
  {
    Type: "Network Activity",
    Details: {
      date: "9/14/2023",
      time: "17:30:23",
      user: "user1",
      dstport: 443,
      duration: 131,
      sentbyte: 2517,
      rcvdbyte: 7529,
      sentpkt: 8,
      rcvdpkt: 10
    },
    RiskLevel: "Low"
  },
  {
    Type: "Network Activity",
    Details: {
      date: "9/14/2023",
      time: "17:31:45",
      user: "user2",
      dstport: 80,
      duration: 95,
      sentbyte: 1834,
      rcvdbyte: 15420,
      sentpkt: 12,
      rcvdpkt: 18
    },
    RiskLevel: "Medium"
  },
  {
    Type: "Network Activity",
    Details: {
      date: "9/14/2023",
      time: "17:33:12",
      user: "admin1",
      dstport: 22,
      duration: 312,
      sentbyte: 125670,
      rcvdbyte: 4328,
      sentpkt: 86,
      rcvdpkt: 42
    },
    RiskLevel: "Critical"
  },
];

export const topRiskyEntities = [
  { id: 'user1', name: 'Alice Johnson', riskScore: 0.75 },
  { id: 'server2', name: 'Database Server', riskScore: 0.68 },
  { id: 'device3', name: 'IoT Device XYZ', riskScore: 0.55 },
  { id: 'user4', name: 'Bob Williams', riskScore: 0.42 },
  { id: 'network5', name: 'Guest Network', riskScore: 0.30 },
];

export const processUploadedLogs = (logs: any[]) => {
  const fileAccessLogs: FileAccessLog[] = [];
  const logonActivityLogs: LogonActivityLog[] = [];
  const networkActivityLogs: NetworkActivityLog[] = [];

  logs.forEach(log => {
    if (log.Type === "File Access") {
      fileAccessLogs.push(log as FileAccessLog);
    } else if (log.Type === "Logon Activity") {
      logonActivityLogs.push(log as LogonActivityLog);
    } else if (log.Type === "Network Activity") {
      networkActivityLogs.push(log as NetworkActivityLog);
    }
  });

  return { fileAccessLogs, logonActivityLogs, networkActivityLogs };
};
