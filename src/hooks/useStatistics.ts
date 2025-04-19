import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Statistics {
  totalProjects: number;
  totalEmployees: number;
  totalClients: number;
  activeProjects: number;
  activeEmployees: number;
  activeClients: number;
  projectsPerClient: { client_name: string; project_count: number }[];
  employeesPerProject: { project_name: string; employee_count: number }[];
  employeeAssignmentStats: {
    assigned: number;
    unassigned: number;
  };
  employeesByDesignation: { designation: string; count: number }[];
  projectStatusDistribution: { status: string; count: number }[];
  timeEntriesByMonth: { month: string; total_hours: number }[];
  clientContractStatus: { status: string; count: number }[];
}

export const useStatistics = () => {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: async (): Promise<Statistics> => {
      const [
        totalProjectsResponse, 
        totalEmployeesResponse, 
        totalClientsResponse,
        activeProjectsResponse,
        activeEmployeesResponse,
        activeClientsResponse,
        projectsPerClientResponse,
        employeesPerProjectResponse,
        employeeAssignmentResponse,
        employeeDesignationsResponse,
        projectStatusResponse,
        timeEntriesResponse,
        clientContractResponse
      ] = await Promise.all([
        supabase.from("projects").select('*', { count: 'exact', head: true }),
        supabase.from("employees").select('*', { count: 'exact', head: true }),
        supabase.from("clients").select('*', { count: 'exact', head: true }),
        supabase.from("projects").select('*', { count: 'exact', head: true }).eq("status", "ACTIVE"),
        supabase.from("employees").select('*', { count: 'exact', head: true }).eq("status", "ACTIVE"),
        supabase.from("clients").select('*', { count: 'exact', head: true }).eq("status", "ACTIVE"),
        supabase
          .from('clients')
          .select(`
            name,
            projects:projects(count)
          `),
        supabase
          .from('projects')
          .select(`
            project_name,
            assignments:assignments(count)
          `),
        supabase
          .from('employees')
          .select('id')
          .select(`
            assigned:assignments(count)
          `),

        supabase
          .from('employees')
          .select('designation')
          .then(({ data }) => {
            const designations = data?.reduce((acc, { designation }) => {
              acc[designation] = (acc[designation] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            return Object.entries(designations || {}).map(([designation, count]) => ({
              designation,
              count
            }));
          }),

        supabase
          .from('projects')
          .select('status')
          .then(({ data }) => {
            const statuses = data?.reduce((acc, { status }) => {
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            return Object.entries(statuses || {}).map(([status, count]) => ({
              status,
              count
            }));
          }),

        supabase
          .from('time_entries')
          .select('date, hours')
          .then(({ data }) => {
            const monthlyHours = data?.reduce((acc, { date, hours }) => {
              const month = new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' });
              acc[month] = (acc[month] || 0) + Number(hours);
              return acc;
            }, {} as Record<string, number>);
            return Object.entries(monthlyHours || {}).map(([month, total_hours]) => ({
              month,
              total_hours
            }));
          }),

        supabase
          .from('clients')
          .select('status')
          .then(({ data }) => {
            const statuses = data?.reduce((acc, { status }) => {
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            return Object.entries(statuses || {}).map(([status, count]) => ({
              status,
              count
            }));
          })
      ]);

      // Transform projects per client data
      const projectsPerClient = (projectsPerClientResponse.data || []).map(client => ({
        client_name: client.name,
        project_count: client.projects?.[0]?.count || 0
      }));

      // Transform employees per project data
      const employeesPerProject = (employeesPerProjectResponse.data || []).map(project => ({
        project_name: project.project_name,
        employee_count: project.assignments?.[0]?.count || 0
      }));

      // Calculate assigned vs unassigned employees
      const totalEmployees = totalEmployeesResponse.count || 0;
      const assignedEmployees = employeeAssignmentResponse.data?.filter(
        employee => (employee.assigned?.[0]?.count || 0) > 0
      ).length || 0;

      return {
        totalProjects: totalProjectsResponse.count || 0,
        totalEmployees: totalEmployeesResponse.count || 0,
        totalClients: totalClientsResponse.count || 0,
        activeProjects: activeProjectsResponse.count || 0,
        activeEmployees: activeEmployeesResponse.count || 0,
        activeClients: activeClientsResponse.count || 0,
        projectsPerClient,
        employeesPerProject,
        employeeAssignmentStats: {
          assigned: assignedEmployees,
          unassigned: totalEmployees - assignedEmployees
        },
        employeesByDesignation: employeeDesignationsResponse,
        projectStatusDistribution: projectStatusResponse,
        timeEntriesByMonth: timeEntriesResponse,
        clientContractStatus: clientContractResponse
      };
    },
  });
};
