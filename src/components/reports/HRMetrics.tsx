import { Card } from "@/components/ui/card";
import { useStatistics } from "@/hooks/useStatistics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Users, UserCheck, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA', '#B794F4'];

export const HRMetrics = () => {
  const { data: stats } = useStatistics();
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          active={stats?.activeEmployees || 0}
          icon={Users}
          color="text-purple-500"
        />
        <StatsCard
          title="Assigned Employees"
          value={stats?.employeeAssignmentStats.assigned || 0}
          icon={UserCheck}
          color="text-green-500"
        />
        <StatsCard
          title="Unassigned Employees"
          value={stats?.employeeAssignmentStats.unassigned || 0}
          icon={Clock}
          color="text-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Employee Distribution by Role</h3>
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
                    data={stats?.employeesByDesignation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="designation"
                    label={({ designation, count }) => `${designation}: ${count}`}
                  >
                    {stats?.employeesByDesignation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Time Distribution</h3>
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
                <BarChart data={stats?.timeEntriesByMonth}>
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="total_hours"
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
