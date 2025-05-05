
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Bell, Shield, Palette, MonitorSmartphone, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    profile: {
      name: "Admin User",
      email: "admin@anomalyguard.com",
      role: "Security Administrator",
      department: "Security Operations",
    },
    notifications: {
      criticalAlerts: true,
      highRiskAlerts: true,
      weeklyReports: true,
      emailNotifications: true,
      smsNotifications: false,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: "30",
      passwordExpiry: "90",
      ipWhitelist: "",
    },
    appearance: {
      theme: "dark",
      compactView: false,
      animationsEnabled: true,
      largeText: false,
    },
    system: {
      logRetentionDays: "90",
      autoUpdates: true,
      telemetry: true,
      dataBackup: true,
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Settings saved successfully");
      setIsSaving(false);
    }, 800);
  };

  return (
    <>
      <Helmet>
        <title>Settings | AnomalyGuard</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <Tabs defaultValue="profile">
            <div className="flex">
              <div className="w-1/4 pr-4">
                <TabsList className="flex flex-col h-auto space-y-1 bg-transparent p-0">
                  <TabsTrigger 
                    value="profile" 
                    className="justify-start px-3 py-2 h-9 w-full data-[state=active]:bg-muted"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="justify-start px-3 py-2 h-9 w-full data-[state=active]:bg-muted"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="justify-start px-3 py-2 h-9 w-full data-[state=active]:bg-muted"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="appearance" 
                    className="justify-start px-3 py-2 h-9 w-full data-[state=active]:bg-muted"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="system" 
                    className="justify-start px-3 py-2 h-9 w-full data-[state=active]:bg-muted"
                  >
                    <MonitorSmartphone className="h-4 w-4 mr-2" />
                    System
                  </TabsTrigger>
                  <TabsTrigger 
                    value="teams" 
                    className="justify-start px-3 py-2 h-9 w-full data-[state=active]:bg-muted"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Teams
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1">
                <TabsContent value="profile" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Manage your profile information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" 
                            value={settings.profile.name}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: {
                                ...settings.profile,
                                name: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={settings.profile.email}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: {
                                ...settings.profile,
                                email: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input 
                            id="role" 
                            value={settings.profile.role}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: {
                                ...settings.profile,
                                role: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input 
                            id="department" 
                            value={settings.profile.department}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: {
                                ...settings.profile,
                                department: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium">Profile Photo</h3>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <Button variant="secondary" size="sm">Change Photo</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Configure how you receive alerts and notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Critical Alerts</Label>
                            <p className="text-sm text-muted-foreground">Receive alerts for critical security issues</p>
                          </div>
                          <Switch 
                            checked={settings.notifications.criticalAlerts}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                criticalAlerts: checked
                              }
                            })}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>High Risk Alerts</Label>
                            <p className="text-sm text-muted-foreground">Receive alerts for high risk user activities</p>
                          </div>
                          <Switch 
                            checked={settings.notifications.highRiskAlerts}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                highRiskAlerts: checked
                              }
                            })}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Weekly Reports</Label>
                            <p className="text-sm text-muted-foreground">Receive weekly security summary reports by email</p>
                          </div>
                          <Switch 
                            checked={settings.notifications.weeklyReports}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                weeklyReports: checked
                              }
                            })}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-3">Delivery Methods</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Email Notifications</Label>
                              <Switch 
                                checked={settings.notifications.emailNotifications}
                                onCheckedChange={(checked) => setSettings({
                                  ...settings,
                                  notifications: {
                                    ...settings.notifications,
                                    emailNotifications: checked
                                  }
                                })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label>SMS Notifications</Label>
                              <Switch 
                                checked={settings.notifications.smsNotifications}
                                onCheckedChange={(checked) => setSettings({
                                  ...settings,
                                  notifications: {
                                    ...settings.notifications,
                                    smsNotifications: checked
                                  }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>Manage security settings and permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Switch 
                          checked={settings.security.twoFactorAuth}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              twoFactorAuth: checked
                            }
                          })}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input 
                            id="sessionTimeout" 
                            type="number" 
                            value={settings.security.sessionTimeout}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: {
                                ...settings.security,
                                sessionTimeout: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                          <Input 
                            id="passwordExpiry" 
                            type="number" 
                            value={settings.security.passwordExpiry}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: {
                                ...settings.security,
                                passwordExpiry: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ipWhitelist">IP Whitelist (comma separated)</Label>
                        <Input 
                          id="ipWhitelist" 
                          placeholder="e.g., 192.168.1.1, 10.0.0.1" 
                          value={settings.security.ipWhitelist}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              ipWhitelist: e.target.value
                            }
                          })}
                        />
                        <p className="text-sm text-muted-foreground">Leave empty to allow all IPs</p>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="secondary">
                          Change Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appearance" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize how AnomalyGuard looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select
                          value={settings.appearance.theme}
                          onValueChange={(value) => setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              theme: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Compact View</Label>
                          <Switch 
                            checked={settings.appearance.compactView}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                compactView: checked
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Enable Animations</Label>
                          <Switch 
                            checked={settings.appearance.animationsEnabled}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                animationsEnabled: checked
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Large Text</Label>
                          <Switch 
                            checked={settings.appearance.largeText}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                largeText: checked
                              }
                            })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="system" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>System</CardTitle>
                      <CardDescription>Configure system-wide settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="logRetention">Log Retention Period (days)</Label>
                        <Input 
                          id="logRetention" 
                          type="number" 
                          value={settings.system.logRetentionDays}
                          onChange={(e) => setSettings({
                            ...settings,
                            system: {
                              ...settings.system,
                              logRetentionDays: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Automatic Updates</Label>
                            <p className="text-sm text-muted-foreground">Keep AnomalyGuard updated automatically</p>
                          </div>
                          <Switch 
                            checked={settings.system.autoUpdates}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              system: {
                                ...settings.system,
                                autoUpdates: checked
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Usage Telemetry</Label>
                            <p className="text-sm text-muted-foreground">Send anonymous usage data to improve the system</p>
                          </div>
                          <Switch 
                            checked={settings.system.telemetry}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              system: {
                                ...settings.system,
                                telemetry: checked
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Automatic Data Backup</Label>
                            <p className="text-sm text-muted-foreground">Regularly back up all logs and configuration</p>
                          </div>
                          <Switch 
                            checked={settings.system.dataBackup}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              system: {
                                ...settings.system,
                                dataBackup: checked
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="pt-2 flex gap-2">
                        <Button variant="secondary">Export All Data</Button>
                        <Button variant="destructive">Reset System</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="teams" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teams & Permissions</CardTitle>
                      <CardDescription>Manage team members and their access permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Team Members</h3>
                          <Button variant="outline" size="sm">+ Add Member</Button>
                        </div>
                        
                        <div className="border rounded-md">
                          <div className="py-3 px-4 flex items-center justify-between border-b">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">Admin User</p>
                                <p className="text-sm text-muted-foreground">admin@anomalyguard.com</p>
                              </div>
                            </div>
                            <Badge>Owner</Badge>
                          </div>
                          
                          <div className="py-3 px-4 flex items-center justify-between border-b">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">Security Analyst</p>
                                <p className="text-sm text-muted-foreground">analyst@anomalyguard.com</p>
                              </div>
                            </div>
                            <Badge variant="outline">Analyst</Badge>
                          </div>
                          
                          <div className="py-3 px-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">SOC Manager</p>
                                <p className="text-sm text-muted-foreground">soc@anomalyguard.com</p>
                              </div>
                            </div>
                            <Badge variant="outline">Manager</Badge>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-3">Role Permissions</h3>
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="font-medium">Role</div>
                              <div className="font-medium">Description</div>
                              <div className="font-medium text-right">Actions</div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-sm py-2 border-t">
                              <div>Administrator</div>
                              <div className="text-muted-foreground">Full system access and configuration</div>
                              <div className="text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-sm py-2 border-t">
                              <div>Analyst</div>
                              <div className="text-muted-foreground">Can view all data and create reports</div>
                              <div className="text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-sm py-2 border-t">
                              <div>Manager</div>
                              <div className="text-muted-foreground">Can manage users and view analytics</div>
                              <div className="text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default SettingsPage;
