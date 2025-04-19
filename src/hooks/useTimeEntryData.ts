
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectData {
  id: string;
  project_name: string;
}

export const useTimeEntryData = (employeeId: string | undefined) => {
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'ACTIVE');

      if (error) throw error;
      return data;
    }
  });

  const { data: availableProjects = [] } = useQuery<ProjectData[]>({
    queryKey: ['assigned-projects', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('assignments')
        .select('project_id, projects(id, project_name)')
        .eq('employee_id', employeeId)
        .eq('status', 'ACTIVE');

      if (error) throw error;
      
      return data.map(item => ({
        id: item.projects?.id || '',
        project_name: item.projects?.project_name || ''
      }));
    },
    enabled: !!employeeId
  });

  return { employees, availableProjects };
};
