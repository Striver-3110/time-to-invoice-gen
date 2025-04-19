
import { Card } from "@/components/ui/card";
import { useStatistics } from "@/hooks/useStatistics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Building2, Users, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const AdminMetrics = () => {
  const { data: stats } = useStatistics();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={Briefcase}
          color="text-green-500"
        />
        <StatsCard
          title="Active Clients"
          value={stats?.activeClients || 0}
          icon={Building2}
          color="text-blue-500"
        />
        <StatsCard
          title="Employee Utilization"
          value={stats ? Math.round((stats.employeeAssignmentStats.assigned / stats.totalEmployees) * 100) : 0}
          icon={Users}
          color="text-purple-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Project Distribution</h3>
          <div className="h-[200px]">
            <ChartContainer
              config={{
                series1: {
                  theme: {
                    light: "#9b87f5",
                    dark: "#7E69AB"
                  }
                }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.employeesPerProject || []}>
                  <XAxis dataKey="project_name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="employee_count"
                    stroke="var(--color-series1)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Employee Assignment Status</h3>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span>Assigned</span>
              <span className="font-semibold">{stats?.employeeAssignmentStats.assigned || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Unassigned</span>
              <span className="font-semibold">{stats?.employeeAssignmentStats.unassigned || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Active Projects</span>
              <span className="font-semibold">{stats?.activeProjects || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Active Clients</span>
              <span className="font-semibold">{stats?.activeClients || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
