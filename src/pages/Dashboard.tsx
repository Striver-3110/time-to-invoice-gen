
import { Briefcase, Users, UserRound } from "lucide-react";
import { useStatistics } from "@/hooks/useStatistics";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsList } from "@/components/dashboard/StatsList";

const Dashboard = () => {
  const { data: stats, isLoading } = useStatistics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          active={stats?.activeProjects}
          icon={Briefcase}
          color="text-purple-500"
        />
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          active={stats?.activeEmployees}
          icon={Users}
          color="text-orange-500"
        />
        <StatsCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          active={stats?.activeClients}
          icon={UserRound}
          color="text-green-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsList
          title="Projects per Client"
          items={stats?.projectsPerClient.map(item => ({
            label: item.client_name,
            value: item.project_count
          })) || []}
        />
        <StatsList
          title="Employees per Project"
          items={stats?.employeesPerProject.map(item => ({
            label: item.project_name,
            value: item.employee_count
          })) || []}
        />
        <StatsList
          title="Employee Assignment Status"
          items={[
            { 
              label: "Assigned to Projects",
              value: stats?.employeeAssignmentStats.assigned || 0
            },
            {
              label: "Not Assigned",
              value: stats?.employeeAssignmentStats.unassigned || 0
            }
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
