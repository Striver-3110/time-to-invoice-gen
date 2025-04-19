
import { Card } from "@/components/ui/card";
import { useStatistics } from "@/hooks/useStatistics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Building2, Users, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const AdminMetrics = () => {
  const { data: stats } = useStatistics();
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA'];

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
          <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
          <div className="h-[300px]">
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
                <PieChart>
                  <Pie
                    data={stats?.projectStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {stats?.projectStatusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Time Tracking Trend</h3>
          <div className="h-[300px]">
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
                <LineChart data={stats?.timeEntriesByMonth}>
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total_hours"
                    stroke="var(--color-series1)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
