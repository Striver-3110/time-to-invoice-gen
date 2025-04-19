
import { Card } from "@/components/ui/card";
import { useStatistics } from "@/hooks/useStatistics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Users, UserCheck, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

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

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Employees Per Project</h3>
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
              <BarChart data={stats?.employeesPerProject || []}>
                <XAxis dataKey="project_name" />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">{payload[0].payload.project_name}</div>
                        <div className="text-right">{payload[0].value} employees</div>
                      </div>
                    </div>
                  );
                }} />
                <Bar
                  dataKey="employee_count"
                  fill="var(--color-series1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};
