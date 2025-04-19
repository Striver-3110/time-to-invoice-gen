
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, 
  SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarFooter 
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Users, 
  Clock, 
  Clipboard, 
  FileText, 
  Home, 
  Settings 
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="px-6">
            <h2 className="text-xl font-semibold">InvoiceGen</h2>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/clients">
                      <Users className="h-5 w-5" />
                      <span>Clients</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/projects">
                      <Clipboard className="h-5 w-5" />
                      <span>Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/employees">
                      <Users className="h-5 w-5" />
                      <span>Employees</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/time-entries">
                      <Clock className="h-5 w-5" />
                      <span>Time Entries</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={cn("bg-primary text-white hover:bg-primary/90")} data-active="true">
                    <Link to="/invoices">
                      <FileText className="h-5 w-5" />
                      <span>Invoices</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/reports">
                      <BarChart3 className="h-5 w-5" />
                      <span>Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="px-6 py-4">
            <Link to="/settings">
              <div className="flex items-center space-x-2">
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
