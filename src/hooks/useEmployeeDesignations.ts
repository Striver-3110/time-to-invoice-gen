
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmployeeDesignations = () => {
  const { toast } = useToast();
  
  const { data: employees } = useQuery({
    queryKey: ['employees-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, designation')
        .eq('status', 'ACTIVE');
        
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch employees"
        });
        throw error;
      }
      
      // Create a map of designation to employee ID
      const employeeDesignationMap: Record<string, string> = {};
      data.forEach((employee: any) => {
        employeeDesignationMap[employee.designation] = employee.id;
      });
      
      return employeeDesignationMap;
    },
  });

  return employees || {};
};
