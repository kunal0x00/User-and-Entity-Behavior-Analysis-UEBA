
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Alert } from "@/components/dashboard/AlertList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import { alertsData } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const AlertsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    severity: string[];
    status: string[];
  }>({
    severity: [],
    status: [],
  });

  const severityOptions = ["low", "medium", "high"];
  const statusOptions = ["new", "investigating", "resolved", "dismissed"];

  const toggleFilter = (type: "severity" | "status", value: string) => {
    setActiveFilters((prev) => {
      const current = [...prev[type]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }
      
      return {
        ...prev,
        [type]: current,
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      severity: [],
      status: [],
    });
  };

  // The Alert type from AlertList and our data should now match correctly
  const filteredAlerts = alertsData.filter((alert) => {
    // Apply search filter
    const searchMatch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.entity.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply severity and status filters
    const severityMatch = activeFilters.severity.length === 0 || activeFilters.severity.includes(alert.severity);
    const statusMatch = activeFilters.status.length === 0 || activeFilters.status.includes(alert.status);
    
    return searchMatch && severityMatch && statusMatch;
  });

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "low":
        return "bg-anomaly-low/10 text-anomaly-low border-anomaly-low/40";
      case "medium":
        return "bg-anomaly-medium/10 text-anomaly-medium border-anomaly-medium/40";
      case "high":
        return "bg-anomaly-high/10 text-anomaly-high border-anomaly-high/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/40";
      case "investigating":
        return "bg-amber-500/10 text-amber-400 border-amber-500/40";
      case "resolved":
        return "bg-green-500/10 text-green-400 border-green-500/40";
      case "dismissed":
        return "bg-gray-500/10 text-gray-400 border-gray-500/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Manage and investigate detected anomalies
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              <span>Filter</span>
              {(activeFilters.severity.length > 0 || activeFilters.status.length > 0) && (
                <Badge className="ml-1 bg-primary">{activeFilters.severity.length + activeFilters.status.length}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="p-2">
              <div className="mb-2">
                <p className="text-xs font-medium mb-1">Severity</p>
                <div className="flex flex-wrap gap-1">
                  {severityOptions.map(severity => (
                    <Badge
                      key={severity}
                      variant={activeFilters.severity.includes(severity) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleFilter("severity", severity)}
                    >
                      {severity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium mb-1">Status</p>
                <div className="flex flex-wrap gap-1">
                  {statusOptions.map(status => (
                    <Badge
                      key={status}
                      variant={activeFilters.status.includes(status) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleFilter("status", status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={clearFilters}
                disabled={activeFilters.severity.length === 0 && activeFilters.status.length === 0}
              >
                Clear All Filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex-1 md:text-right">
          <span className="text-sm text-muted-foreground">
            {filteredAlerts.length} alerts
          </span>
        </div>
      </div>

      {/* Active filters display */}
      {(activeFilters.severity.length > 0 || activeFilters.status.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.severity.map(severity => (
            <Badge 
              key={`filter-${severity}`} 
              variant="outline" 
              className={cn("flex items-center gap-1 capitalize", getSeverityColor(severity as any))}
            >
              {severity}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => toggleFilter("severity", severity)}
              />
            </Badge>
          ))}
          {activeFilters.status.map(status => (
            <Badge 
              key={`filter-${status}`} 
              variant="outline" 
              className={cn("flex items-center gap-1 capitalize", getStatusColor(status as any))}
            >
              {status}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => toggleFilter("status", status)}
              />
            </Badge>
          ))}
          {(activeFilters.severity.length > 0 || activeFilters.status.length > 0) && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className="overflow-hidden">
            <div className={cn(
              "w-1 absolute left-0 top-0 bottom-0",
              alert.severity === "high" ? "bg-anomaly-high" :
              alert.severity === "medium" ? "bg-anomaly-medium" :
              "bg-anomaly-low"
            )}></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  <CardDescription>{alert.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Investigate</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                    <DropdownMenuItem>Dismiss</DropdownMenuItem>
                    <DropdownMenuItem>Assign</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                  {alert.severity} severity
                </Badge>
                <Badge variant="outline" className={getStatusColor(alert.status)}>
                  {alert.status}
                </Badge>
                <span className="text-muted-foreground">{alert.timestamp}</span>
                <span className="text-muted-foreground">User: {alert.entity}</span>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm">View Details</Button>
                <Button size="sm">Investigate</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-card">
            <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">No alerts found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery 
                ? `No alerts match your search term "${searchQuery}". Try a different search term or adjust your filters.` 
                : "No alerts match your current filter settings. Try adjusting your filters."}
            </p>
            {(searchQuery || activeFilters.severity.length > 0 || activeFilters.status.length > 0) && (
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                clearFilters();
              }}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
