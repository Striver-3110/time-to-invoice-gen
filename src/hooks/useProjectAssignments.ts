
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProjectAssignments = (projects: any[] | undefined) => {
  const { toast } = useToast();

  const { data: assignmentMap = {} } = useQuery({
    queryKey: ['project-assignments', projects?.map(p => p.id)],
    queryFn: async () => {
      if (!projects || projects.length === 0) return {};
      
      const projectIds = projects.map(project => project.id);
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          employee_id,
          project_id,
          employees(designation)
        `)
        .in('project_id', projectIds)
        .eq('status', 'ACTIVE');
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch assignments"
        });
        throw error;
      }
      
      const newAssignmentMap: Record<string, Record<string, string>> = {};
      
      data.forEach((assignment: any) => {
        if (!newAssignmentMap[assignment.project_id]) {
          newAssignmentMap[assignment.project_id] = {};
        }
        
        const designation = assignment.employees?.designation;
        if (designation) {
          newAssignmentMap[assignment.project_id][designation] = assignment.id;
        }
      });
      
      return newAssignmentMap;
    },
    enabled: !!projects && projects.length > 0
  });

  return assignmentMap;
};
