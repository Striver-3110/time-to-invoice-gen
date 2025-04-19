import { Card } from "@/components/ui/card";
import { useStatistics } from "@/hooks/useStatistics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Building2, Users, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const FinanceMetrics = () => {
  const { data: stats } = useStatistics();
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          active={stats?.activeClients || 0}
          icon={Building2}
          color="text-blue-500"
        />
        <StatsCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          active={stats?.activeProjects || 0}
          icon={Briefcase}
          color="text-indigo-500"
        />
        <StatsCard
          title="Active Employees"
          value={stats?.activeEmployees || 0}
          icon={Users}
          color="text-purple-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Client Contract Status Distribution</h3>
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
                    data={stats?.clientContractStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {stats?.clientContractStatus.map((_, index) => (
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
          <h3 className="text-lg font-semibold mb-4">Projects Per Client</h3>
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
                <BarChart data={stats?.projectsPerClient}>
                  <XAxis dataKey="client_name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="project_count"
                    fill="var(--color-series1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
