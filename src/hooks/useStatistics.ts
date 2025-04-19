
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Statistics {
  totalProjects: number;
  totalEmployees: number;
  totalClients: number;
  activeProjects: number;
  activeEmployees: number;
  activeClients: number;
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
      ] = await Promise.all([
        supabase.from("projects").select('*', { count: 'exact', head: true }),
        supabase.from("employees").select('*', { count: 'exact', head: true }),
        supabase.from("clients").select('*', { count: 'exact', head: true }),
        supabase.from("projects").select('*', { count: 'exact', head: true }).eq("status", "ACTIVE"),
        supabase.from("employees").select('*', { count: 'exact', head: true }).eq("status", "ACTIVE"),
        supabase.from("clients").select('*', { count: 'exact', head: true }).eq("status", "ACTIVE"),
      ]);

      return {
        totalProjects: totalProjectsResponse.count || 0,
        totalEmployees: totalEmployeesResponse.count || 0,
        totalClients: totalClientsResponse.count || 0,
        activeProjects: activeProjectsResponse.count || 0,
        activeEmployees: activeEmployeesResponse.count || 0,
        activeClients: activeClientsResponse.count || 0,
      };
    },
  });
};
