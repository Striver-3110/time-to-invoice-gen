
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeDesignations } from "./useEmployeeDesignations";
import { useProjectAssignments } from "./useProjectAssignments";
import { useTimesheetGeneration } from "./useTimesheetGeneration";

export const useInvoiceGeneration = (
  clientId: string | undefined,
  billingStart: Date,
  billingEnd: Date
) => {
  // Fetch client projects
  const { data: projects } = useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  const employeeMap = useEmployeeDesignations();
  const assignmentMap = useProjectAssignments(projects);
  const { projectTimesheets, totalAmount } = useTimesheetGeneration(
    projects,
    billingStart,
    billingEnd
  );

  return {
    projectTimesheets,
    totalAmount,
    assignmentMap,
    employeeMap
  };
};
