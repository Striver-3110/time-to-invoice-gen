
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
        { count: totalProjects }, 
        { count: totalEmployees }, 
        { count: totalClients },
        { count: activeProjects },
        { count: activeEmployees },
        { count: activeClients },
      ] = await Promise.all([
        supabase.from("projects").count(),
        supabase.from("employees").count(),
        supabase.from("clients").count(),
        supabase.from("projects").count().eq("status", "ACTIVE"),
        supabase.from("employees").count().eq("status", "ACTIVE"),
        supabase.from("clients").count().eq("status", "ACTIVE"),
      ]);

      return {
        totalProjects: totalProjects || 0,
        totalEmployees: totalEmployees || 0,
        totalClients: totalClients || 0,
        activeProjects: activeProjects || 0,
        activeEmployees: activeEmployees || 0,
        activeClients: activeClients || 0,
      };
    },
  });
};
