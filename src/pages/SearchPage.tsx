import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Calendar, FileText, User, AlertTriangle, Shield } from "lucide-react";
import { fetchLogs } from "@/services/logService";
import { FileAccessLog, LogonActivityLog, NetworkActivityLog } from "@/services/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { alertsData } from "@/services/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type SearchResult = {
  type: 'user' | 'alert' | 'event';
  id: string;
  name: string;
  details: string;
  risk?: number;
  timestamp?: string;
  severity?: string;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [fileAccessLogs, setFileAccessLogs] = useState<FileAccessLog[]>([]);
  const [logonActivityLogs, setLogonActivityLogs] = useState<LogonActivityLog[]>([]);
  const [networkActivityLogs, setNetworkActivityLogs] = useState<NetworkActivityLog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch logs on component mount
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await fetchLogs();
        setFileAccessLogs(logs.fileAccessLogs);
        setLogonActivityLogs(logs.logonActivityLogs);
        setNetworkActivityLogs(logs.networkActivityLogs);
      } catch (error) {
        console.error("Error loading logs:", error);
        toast.error("Failed to load logs for search");
      }
    };
    
    loadLogs();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results: SearchResult[] = [];
      
      // Search users (from logs)
      const searchedUsers = new Set<string>();
      
      // Search in file access logs
      fileAccessLogs.forEach(log => {
        const hostname = log.Details.Hostname;
        if (
          hostname.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !searchedUsers.has(hostname)
        ) {
          searchedUsers.add(hostname);
          results.push({
            type: 'user',
            id: hostname,
            name: hostname,
            details: `Last file access: ${log.Details.Date || 'Unknown'}`,
            risk: log.RiskLevel === "High" ? 0.8 : 
                  log.RiskLevel === "Medium" ? 0.5 : 0.2
          });
        }
      });
      
      // Search in logon activity logs
      logonActivityLogs.forEach(log => {
        const hostname = log.Details.Hostname;
        if (
          hostname.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !searchedUsers.has(hostname)
        ) {
          searchedUsers.add(hostname);
          results.push({
            type: 'user',
            id: hostname,
            name: hostname,
            details: `Login activity on ${log.Details.Date || 'Unknown'}`,
            risk: log.RiskLevel === "High" ? 0.8 : 
                  log.RiskLevel === "Medium" ? 0.5 : 0.2
          });
        }
      });
      
      // Search in network activity logs
      networkActivityLogs.forEach(log => {
        const user = log.Details.user;
        if (
          user.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !searchedUsers.has(user)
        ) {
          searchedUsers.add(user);
          results.push({
            type: 'user',
            id: user,
            name: user,
            details: `Network activity at ${log.Details.time || 'Unknown'}`,
            risk: log.RiskLevel === "High" ? 0.8 : 
                  log.RiskLevel === "Medium" ? 0.5 : 0.2
          });
        }
      });
      
      // Search in alerts
      alertsData.forEach(alert => {
        if (
          alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (alert.entity && alert.entity.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          results.push({
            type: 'alert',
            id: alert.id.toString(),
            name: alert.title,
            details: alert.description,
            timestamp: alert.timestamp,
            severity: alert.severity
          });
        }
      });
      
      // Search in events (combine file access and logon and network events)
      // File access events
      fileAccessLogs.forEach(log => {
        if (Object.values(log.Details).some(detail => 
          typeof detail === 'string' && detail.toLowerCase().includes(searchQuery.toLowerCase())
        )) {
          results.push({
            type: 'event',
            id: `file-${log.Details.Hostname}-${log.Details.Date || 'unknown'}`,
            name: `File Access - ${log.Details.Hostname}`,
            details: `${log.Details["Number of Files Accessed"] || 0} files accessed on ${log.Details.Date || 'Unknown'}`,
            timestamp: log.Details.Date || 'Unknown'
          });
        }
      });
      
      // Logon events
      logonActivityLogs.forEach(log => {
        if (Object.values(log.Details).some(detail => 
          typeof detail === 'string' && detail.toLowerCase().includes(searchQuery.toLowerCase())
        )) {
          results.push({
            type: 'event',
            id: `logon-${log.Details.Hostname}-${log.Details.Date || 'unknown'}`,
            name: `Logon Activity - ${log.Details.Hostname}`,
            details: `${log.Details["No. of Logins"] || 0} logins, ${log.Details["No. of Failed Login Attempts"] || 0} failed attempts`,
            timestamp: log.Details.Date || 'Unknown'
          });
        }
      });
      
      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length === 0) {
        toast.info(`No results found for "${searchQuery}"`);
      } else {
        toast.success(`Found ${results.length} results for "${searchQuery}"`);
      }
    }, 800);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const handleAlertClick = (alertId: string) => {
    navigate(`/alerts/${alertId}`);
  };

  const filterResults = (type: string) => {
    if (type === 'all') return searchResults;
    return searchResults.filter(result => result.type === type);
  };

  return (
    <>
      <Helmet>
        <title>Search | AnomalyGuard</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex w-full items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Search across all data sources..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                    }}
                  />
                  <Button 
                    type="submit" 
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    <Search className="h-4 w-4 mr-2" /> 
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" /> Filters
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Time Range
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" /> Users
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Events
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="user">Users</TabsTrigger>
              <TabsTrigger value="alert">Alerts</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterResults('all').map((result) => (
                            <TableRow key={result.id}>
                              <TableCell>
                                <Badge variant="outline" className={
                                  result.type === 'user' ? "bg-blue-900/20 text-blue-400" :
                                  result.type === 'alert' ? "bg-red-900/20 text-red-400" :
                                  "bg-green-900/20 text-green-400"
                                }>
                                  {result.type === 'user' ? <User className="h-3 w-3 mr-1" /> :
                                   result.type === 'alert' ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                                   <FileText className="h-3 w-3 mr-1" />}
                                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {result.type === 'user' && (
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarFallback className="text-xs">
                                        {result.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {result.name}
                                  </div>
                                )}
                                {result.type !== 'user' && result.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {result.details}
                                {result.timestamp && <span className="ml-2 text-xs opacity-70">{result.timestamp}</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (result.type === 'user') handleUserClick(result.id);
                                    else if (result.type === 'alert') handleAlertClick(result.id);
                                  }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Search Across All Data</h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter keywords, user IDs, IP addresses, or any other identifiers to search across the entire platform.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="user" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {filterResults('user').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults('user').map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="text-xs">
                                    {user.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.details}</TableCell>
                            <TableCell>
                              {user.risk && (
                                <div className="flex items-center">
                                  <div className={`h-2 w-2 rounded-full mr-2 ${
                                    user.risk > 0.7 ? "bg-red-500" :
                                    user.risk > 0.4 ? "bg-orange-500" :
                                    "bg-green-500"
                                  }`}></div>
                                  <span className={
                                    user.risk > 0.7 ? "text-red-400" :
                                    user.risk > 0.4 ? "text-orange-400" :
                                    "text-green-400"
                                  }>
                                    {user.risk > 0.7 ? "High" :
                                     user.risk > 0.4 ? "Medium" :
                                     "Low"}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUserClick(user.id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <User className="h-8 w-8 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No user results found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="alert" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {filterResults('alert').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults('alert').map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell className="font-medium">{alert.name}</TableCell>
                            <TableCell className="text-muted-foreground">{alert.details}</TableCell>
                            <TableCell>
                              <Badge className={
                                alert.severity === "critical" ? "bg-red-900/20 text-red-400 border-red-800/30" :
                                alert.severity === "high" ? "bg-orange-900/20 text-orange-400 border-orange-800/30" :
                                alert.severity === "medium" ? "bg-amber-900/20 text-amber-400 border-amber-800/30" :
                                "bg-green-900/20 text-green-400 border-green-800/30"
                              }>
                                {alert.severity?.charAt(0).toUpperCase() + alert.severity?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {alert.timestamp}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No alerts found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="event" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {filterResults('event').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults('event').map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.name}</TableCell>
                            <TableCell className="text-muted-foreground">{event.details}</TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {event.timestamp}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No events found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default SearchPage;
