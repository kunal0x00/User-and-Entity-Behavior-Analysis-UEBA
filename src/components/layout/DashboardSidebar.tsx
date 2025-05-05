
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart2, 
  Shield, 
  Users, 
  AlertTriangle, 
  Settings, 
  Home,
  FileText,
  Database,
  Search,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
}

const SidebarItem = ({ icon: Icon, label, to, isActive }: SidebarItemProps) => (
  <Link to={to} className="w-full">
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 font-normal h-10 px-4 relative overflow-hidden",
        isActive 
          ? "bg-sidebar-accent text-primary cyber-border after:content-[''] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary" 
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon size={18} className={isActive ? "text-primary" : ""} />
      <span>{label}</span>
    </Button>
  </Link>
);

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const mainNavItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Users, label: "Users & Entities", to: "/users" },
    { icon: AlertTriangle, label: "Alerts", to: "/alerts" },
    { icon: BarChart2, label: "Analytics", to: "/analytics" },
    // { icon: Shield, label: "Investigation", to: "/investigation" },
  ];

  const secondaryNavItems = [
    { icon: FileText, label: "Reports", to: "/reports" },
    { icon: Database, label: "Data Management", to: "/data" },
    { icon: Search, label: "Search", to: "/search" },
    // { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTk2RjMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptLTUgMmg0djFoLTR2LTF6bTAtMmgxdjRoLTF2LTR6bS01IDJoNHYxaC00di0xem0wLTJoMXY0aC0xdi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border relative z-10">
        <div className="bg-primary/10 p-2 rounded-md flex items-center justify-center">
          <img 
            src="/lovable-uploads/6e782c53-fa7e-4c3f-aead-07f8c92884a5.png" 
            alt="Open UEBA Logo" 
            className="h-8 w-auto" 
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sidebar-foreground flex items-center">
            Open<span className="text-primary">UEBA</span>
          </h1>
          <p className="text-xs text-muted-foreground">Security Analytics Platform</p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-2 py-4 gap-1 overflow-auto relative z-10">
        <div className="mb-2">
          <p className="px-4 text-xs font-semibold text-sidebar-foreground/50 mb-2 uppercase tracking-wider">
            Main
          </p>
          {mainNavItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={currentPath === item.to}
            />
          ))}
        </div>

        <div className="mb-2">
          <p className="px-4 text-xs font-semibold text-sidebar-foreground/50 mb-2 uppercase tracking-wider">
            Tools
          </p>
          {secondaryNavItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={currentPath === item.to}
            />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border mt-auto relative z-10">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
