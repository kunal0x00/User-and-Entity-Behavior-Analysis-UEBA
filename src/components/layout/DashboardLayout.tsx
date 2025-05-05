
import React from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-6 data-grid relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1a2e44]/20 to-background z-[-1]"></div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
