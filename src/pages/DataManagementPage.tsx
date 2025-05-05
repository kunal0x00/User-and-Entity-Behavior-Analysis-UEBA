
import React from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Database, Upload, Server, FileUp, Filter, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const DataManagementPage = () => {
  return (
    <>
      <Helmet>
        <title>Data Management | AnomalyGuard</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Import Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Sources
                </CardTitle>
                <CardDescription>Connected data sources and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Authentication Logs</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>File Access Logs</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span>Network Activity</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Delayed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Email Logs</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Disconnected</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <Button variant="outline" size="sm" className="w-full">
                  <Server className="mr-2 h-4 w-4" /> Manage Connections
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-primary" />
                  Data Ingestion
                </CardTitle>
                <CardDescription>Current ingestion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Daily Processing</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processed today:</span>
                    <span className="font-medium">1.2M events</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last updated:</span>
                    <span className="font-medium">10 minutes ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing rate:</span>
                    <span className="font-medium">2,350 events/sec</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <Button variant="outline" size="sm" className="w-full">
                  View Detailed Stats
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Data Quality
                </CardTitle>
                <CardDescription>Quality metrics and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Data completeness:</span>
                    <span className="font-medium text-green-500">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format errors:</span>
                    <span className="font-medium text-amber-500">143</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate records:</span>
                    <span className="font-medium">56</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing timestamps:</span>
                    <span className="font-medium text-red-500">27</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <Button variant="outline" size="sm" className="w-full">
                  <Filter className="mr-2 h-4 w-4" /> Data Cleaning Tools
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="datasets">
            <TabsList>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
              <TabsTrigger value="retention">Retention Policies</TabsTrigger>
              <TabsTrigger value="pipelines">ETL Pipelines</TabsTrigger>
            </TabsList>
            <TabsContent value="datasets" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Datasets</CardTitle>
                  <CardDescription>Browse and manage your data sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 text-sm font-medium border-b pb-2">
                      <div>Dataset</div>
                      <div>Type</div>
                      <div>Size</div>
                      <div>Last Updated</div>
                    </div>
                    
                    {[
                      {name: "Authentication Logs", type: "Event Logs", size: "2.4GB", updated: "10 min ago"},
                      {name: "File Access Records", type: "Event Logs", size: "1.7GB", updated: "25 min ago"},
                      {name: "User Profiles", type: "Reference Data", size: "156MB", updated: "2 hours ago"},
                      {name: "Network Traffic", type: "Streaming Data", size: "4.8GB", updated: "5 min ago"},
                      {name: "Anomaly Events", type: "Processed Data", size: "845MB", updated: "15 min ago"},
                    ].map((dataset, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-4 py-3 border-b text-sm">
                        <div className="font-medium">{dataset.name}</div>
                        <div>{dataset.type}</div>
                        <div>{dataset.size}</div>
                        <div className="flex justify-between items-center">
                          <span>{dataset.updated}</span>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="retention" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Retention Policies</CardTitle>
                  <CardDescription>Configure how long data is stored</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 text-sm font-medium border-b pb-2">
                      <div>Data Category</div>
                      <div>Retention Period</div>
                      <div>Actions</div>
                    </div>
                    
                    {[
                      {category: "Raw Log Data", period: "90 days"},
                      {category: "User Activity", period: "1 year"},
                      {category: "Security Alerts", period: "3 years"},
                      {category: "System Metrics", period: "30 days"},
                      {category: "Audit Records", period: "7 years"},
                    ].map((policy, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-3 py-3 border-b text-sm">
                        <div className="font-medium">{policy.category}</div>
                        <div>{policy.period}</div>
                        <div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pipelines" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ETL Pipelines</CardTitle>
                  <CardDescription>Data transformation and loading pipelines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 text-sm font-medium border-b pb-2">
                      <div>Pipeline</div>
                      <div>Status</div>
                      <div>Last Run</div>
                      <div>Actions</div>
                    </div>
                    
                    {[
                      {name: "Auth Log Processor", status: "Running", lastRun: "Continuous"},
                      {name: "File Access Enrichment", status: "Running", lastRun: "Continuous"},
                      {name: "User Behavior Metrics", status: "Scheduled", lastRun: "Today, 6:00 AM"},
                      {name: "Anomaly Score Calculator", status: "Running", lastRun: "Continuous"},
                      {name: "Monthly Compliance Report", status: "Idle", lastRun: "April 1, 2025"},
                    ].map((pipeline, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-4 py-3 border-b text-sm">
                        <div className="font-medium">{pipeline.name}</div>
                        <div className={
                          pipeline.status === "Running" ? "text-green-500" : 
                          pipeline.status === "Scheduled" ? "text-blue-500" : 
                          "text-muted-foreground"
                        }>
                          {pipeline.status}
                        </div>
                        <div>{pipeline.lastRun}</div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DataManagementPage;
