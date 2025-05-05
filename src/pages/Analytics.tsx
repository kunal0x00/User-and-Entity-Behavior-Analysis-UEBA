
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnomalyTrend from "@/components/dashboard/AnomalyTrend";
import NetworkActivityGraph from "@/components/dashboard/NetworkActivityGraph";
import UserRiskFactors, { RiskFactor } from "@/components/dashboard/UserRiskFactors";
import { fileAccessData, failedLoginData, loginActivityData, enhancedUserRiskData, networkActivityData } from "@/services/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for the algorithm performance
const algorithmPerformanceData = [
  { feature: "Time Period", importance: 0.4521 },
  { feature: "Day", importance: 0.1245 },
  { feature: "No. of Logins", importance: 0.2756 },
  { feature: "No. of Logouts", importance: 0.1523 },
  { feature: "Failed Login Attempts", importance: 0.6823 },
  { feature: "Account Lockouts", importance: 0.8941 },
];

// Mock data for the anomaly distribution
const anomalyDistributionData = [
  { name: "Login Time", count: 8 },
  { name: "Failed Logins", count: 12 },
  { name: "File Access", count: 15 },
  { name: "Data Volume", count: 6 },
  { name: "Account Lockout", count: 3 },
];

// Create default risk factors if not present
const defaultRiskFactors = [
  { category: "Failed Logins", value: 0.3 },
  { category: "Unusual Time", value: 0.2 },
  { category: "New Location", value: 0.15 },
  { category: "Data Access", value: 0.25 },
  { category: "Admin Actions", value: 0.1 }
];

const Analytics = () => {
  const [selectedUser, setSelectedUser] = useState(enhancedUserRiskData[0].id);
  
  const selectedUserData = enhancedUserRiskData.find(user => user.id === selectedUser) || enhancedUserRiskData[0];

  // Transform risk factors to match the expected format
  const transformRiskFactors = (factors: { category: string; value: number }[]): RiskFactor[] => {
    return factors.map(factor => ({
      factor: factor.category,
      weight: 0.2, // Equal weight distribution for all factors
      score: factor.value
    }));
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Review performance metrics and anomaly detection statistics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnomalyTrend
          title="Login Activity Analysis"
          description="Pattern visualization with anomaly detection"
          data={loginActivityData}
        />
        <NetworkActivityGraph
          title="Network Traffic Analysis"
          description="Sent and received bytes with anomaly detection"
          data={networkActivityData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>
              Relative importance of features in anomaly detection algorithm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={algorithmPerformanceData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    domain={[0, 1]} 
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    dataKey="feature" 
                    type="category" 
                    width={100}
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      borderColor: "hsl(var(--border))",
                      color: "white"
                    }}
                    formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Importance']}
                  />
                  <Bar 
                    dataKey="importance" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  >
                    {algorithmPerformanceData.map((entry, index) => {
                      const value = entry.importance;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={value > 0.6 ? "#ef4444" : value > 0.3 ? "#f97316" : "#3b82f6"} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anomaly Distribution</CardTitle>
            <CardDescription>
              Types of anomalies detected in the environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={anomalyDistributionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      borderColor: "hsl(var(--border))",
                      color: "white"
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                  >
                    {anomalyDistributionData.map((entry, index) => {
                      const value = entry.count;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={value > 10 ? "#ef4444" : value > 5 ? "#f97316" : "#3b82f6"} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Risk Analysis</CardTitle>
              <CardDescription>Detailed breakdown of risk factors by user</CardDescription>
            </div>
            <Select 
              value={selectedUser} 
              onValueChange={setSelectedUser}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {enhancedUserRiskData.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <UserRiskFactors
              userId={selectedUserData.id}
              userName={selectedUserData.name}
              factors={transformRiskFactors(selectedUserData.riskFactors || defaultRiskFactors)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Access Anomaly Detection</CardTitle>
            <CardDescription>
              Analysis of file access patterns with anomaly scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={fileAccessData.map(item => ({ name: item.timestamp, value: item.value, anomalyScore: item.anomalyScore }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 1]}
                    tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      borderColor: "hsl(var(--border))",
                      color: "white"
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="value" 
                    name="File Access Count"
                    stroke="#10b981" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="anomalyScore" 
                    name="Anomaly Score"
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
