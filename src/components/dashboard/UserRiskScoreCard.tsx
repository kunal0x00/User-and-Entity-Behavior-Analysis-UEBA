
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { User, TrendingUp, TrendingDown } from 'lucide-react';

interface UserRiskData {
  id: string;
  name: string;
  department: string;
  riskScore: number;
  trend: number;
}

interface UserRiskScoreCardProps {
  users: UserRiskData[];
  className?: string;
}

const UserRiskScoreCard: React.FC<UserRiskScoreCardProps> = ({ users, className }) => {
  // Filter out to show only users that have actual data
  const validUsers = users.filter(u => u.name && u.riskScore >= 0);
  
  // Sort users by risk score in descending order
  const sortedUsers = [...validUsers].sort((a, b) => b.riskScore - a.riskScore);

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return "var(--anomaly-high)";
    if (score >= 0.4) return "var(--anomaly-medium)";
    return "var(--anomaly-low)";
  };
  
  const placeholderMessage = 
    !users.length || !validUsers.length ? (
      <div className="h-72 flex items-center justify-center text-muted-foreground">
        No user risk data available
      </div>
    ) : null;

  return (
    <Card className={cn("cyber-border backdrop-blur-sm scanning-effect", className)}>
      <CardHeader>
        <CardTitle>High Risk Users</CardTitle>
        <CardDescription>Users with highest risk assessment scores</CardDescription>
      </CardHeader>
      <CardContent>
        {placeholderMessage || (
          <div className="h-auto  ">
            <ChartContainer
              config={{
                riskScore: { label: "Risk Score" },
              }}
            >
              <BarChart
                data={sortedUsers.slice(0, 10)} // Limit to top 10 users
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  domain={[0, 1]} 
                  tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                  stroke="rgba(255,255,255,0.1)"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={110}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                  stroke="rgba(255,255,255,0.1)"
                />
                <Tooltip
                  formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Risk Score']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="riskScore" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {sortedUsers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
        
        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
          {sortedUsers.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 bg-background/50 rounded-md border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.department || "Unknown"}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={cn(
                  "text-sm font-bold",
                  user.riskScore >= 0.7 ? "text-anomaly-high" : 
                  user.riskScore >= 0.4 ? "text-anomaly-medium" : "text-anomaly-low"
                )}>
                  {Math.round(user.riskScore * 100)}%
                </div>
                <div className="flex items-center text-xs gap-1">
                  {user.trend > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-anomaly-high" />
                      <span className="text-anomaly-high">+{Math.abs(user.trend * 100).toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-anomaly-low" />
                      <span className="text-anomaly-low">{Math.abs(user.trend * 100).toFixed(0)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRiskScoreCard;
