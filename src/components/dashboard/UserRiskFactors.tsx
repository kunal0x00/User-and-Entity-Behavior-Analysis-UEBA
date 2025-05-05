
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
}

interface UserRiskFactorsProps {
  userId: string;
  userName: string;
  factors: RiskFactor[];
  className?: string;
  overallRiskScore?: number;
}

const UserRiskFactors: React.FC<UserRiskFactorsProps> = ({
  userId,
  userName,
  factors,
  className,
  overallRiskScore
}) => {
  // Calculate total risk score based on formula if not provided
  const totalRiskScore = overallRiskScore !== undefined ? 
    overallRiskScore : 
    factors.reduce((total, factor) => total + (factor.weight * factor.score), 0);
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-anomaly-high";
    if (score >= 0.4) return "text-anomaly-medium";
    return "text-anomaly-low";
  };

  // Get progress bar color based on score
  const getProgressColor = (score: number) => {
    if (score >= 0.7) return "bg-anomaly-high";
    if (score >= 0.4) return "bg-anomaly-medium";
    return "bg-anomaly-low";
  };

  return (
    <Card className={cn("cyber-border scanning-effect", className)}>
      <CardHeader>
        <CardTitle>Risk Profile: {userName}</CardTitle>
        <CardDescription>
          Analysis of risk factors and their contribution to overall risk score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 border border-border/30 rounded-md bg-secondary/20">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Overall Risk Score</span>
            <span className={cn("text-sm font-bold", getScoreColor(totalRiskScore))}>
              {(totalRiskScore * 100).toFixed(0)}%
            </span>
          </div>
          <Progress
            value={totalRiskScore * 100}
            className="h-2"
            indicatorClassName={getProgressColor(totalRiskScore)}
          />
        </div>

        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div key={`${userId}-factor-${index}`} className="space-y-1">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{factor.factor}</span>
                  <span className="text-xs text-muted-foreground">
                    (Weight: {(factor.weight * 100).toFixed(0)}%)
                  </span>
                </div>
                <span className={cn("text-sm font-bold", getScoreColor(factor.score))}>
                  {(factor.score * 100).toFixed(0)}%
                </span>
              </div>
              <Progress
                value={factor.score * 100}
                className="h-1.5"
                indicatorClassName={getProgressColor(factor.score)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 border border-border/30 rounded-md bg-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-medium">Risk Calculation Formula</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p>This formula calculates the risk score based on file access patterns, login activity, and network behavior.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Risk_Score = 38.36454020555577*s1[-0.03249382] + s2[0.05180103] + s3[0.18216909]
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            Where:
            <ul className="list-disc pl-4 mt-1">
              <li>s1: Score of File Access</li>
              <li>s2: Score of Logon Activity</li>
              <li>s3: Score of Network Activity</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRiskFactors;
