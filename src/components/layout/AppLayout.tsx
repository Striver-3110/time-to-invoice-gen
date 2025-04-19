import { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, 
  SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, 
  SidebarGroup, SidebarFooter 
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Users, 
  Clock, 
  FileText, 
  Home, 
  Settings,
  UserRoundPlus,
  Briefcase
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/",
      color: "text-blue-500 group-hover:text-blue-600"
    },
    { 
      icon: UserRoundPlus, 
      label: "Clients", 
      path: "/clients", 
      color: "text-green-500 group-hover:text-green-600"
    },
    { 
      icon: Briefcase, 
      label: "Projects", 
      path: "/projects", 
      color: "text-purple-500 group-hover:text-purple-600"
    },
    { 
      icon: Users, 
      label: "Employees", 
      path: "/employees", 
      color: "text-orange-500 group-hover:text-orange-600"
    },
    { 
      icon: Clock, 
      label: "Time Entries", 
      path: "/time-entries", 
      color: "text-teal-500 group-hover:text-teal-600"
    },
    { 
      icon: FileText, 
      label: "Invoices", 
      path: "/invoices", 
      color: "text-red-500 group-hover:text-red-600"
    },
    { 
      icon: BarChart3, 
      label: "Reports", 
      path: "/reports", 
      color: "text-indigo-500 group-hover:text-indigo-600"
    }
  ];
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between px-6 pt-4">
            <h2 className="text-2xl font-bold text-primary">InvoiceGen</h2>
            <SidebarTrigger />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      className={cn(
                        "group w-full", 
                        location.pathname === item.path && "bg-primary/10"
                      )}
                      tooltip={item.label}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className={cn(
                          "h-5 w-5", 
                          item.color,
                          location.pathname === item.path && "font-bold"
                        )} />
                        <span className={
                          location.pathname === item.path ? "font-semibold" : ""
                        }>
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="px-6 py-4">
            <Link to="/settings">
              <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </div>
            </Link>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 overflow-x-hidden">
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
