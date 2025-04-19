
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { ProjectTimesheet } from "@/types/invoice";

export const useTimesheetGeneration = (
  projects: any[] | undefined,
  billingStart: Date,
  billingEnd: Date
) => {
  const { toast } = useToast();

  const { data } = useQuery({
    queryKey: ['generate-timesheets', projects?.map(p => p.id), billingStart, billingEnd],
    queryFn: async () => {
      if (!projects || !billingStart || !billingEnd) {
        return { projectTimesheets: [], totalAmount: 0 };
      }

      const startDate = format(billingStart, 'yyyy-MM-dd');
      const endDate = format(billingEnd, 'yyyy-MM-dd');
      
      // First get all assignments for these projects to access hourly rates
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          project_id,
          employee_id,
          hourly_rate,
          employees(id, designation)
        `)
        .in('project_id', projects.map(p => p.id))
        .eq('status', 'ACTIVE');
      
      if (assignmentsError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch assignments data"
        });
        throw assignmentsError;
      }
      
      // Create a map of employee designations and hourly rates per project
      const ratesByProjectAndDesignation: Record<string, Record<string, number>> = {};
      
      assignments.forEach((assignment: any) => {
        const projectId = assignment.project_id;
        const designation = assignment.employees?.designation;
        
        if (!designation) return;
        
        if (!ratesByProjectAndDesignation[projectId]) {
          ratesByProjectAndDesignation[projectId] = {};
        }
        
        ratesByProjectAndDesignation[projectId][designation] = assignment.hourly_rate;
      });
      
      const timesheetsPromises = projects.map(async (project) => {
        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select(`
            id, 
            employee_id, 
            project_id, 
            date, 
            hours,
            employees(id, designation)
          `)
          .eq('project_id', project.id)
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Could not fetch time entries for project ${project.project_name}`
          });
          return null;
        }
        
        if (!timeEntries || timeEntries.length === 0) {
          return {
            projectId: project.id,
            projectName: project.project_name,
            employees: []
          };
        }
        
        const designationMap = new Map<string, {
          hours: number;
          rate: number;
          amount: number;
        }>();
        
        timeEntries.forEach((entry: any) => {
          const designation = entry.employees.designation;
          const hours = entry.hours;
          
          // Get hourly rate from assignments, fallback to 75 if not found
          const hourlyRate = ratesByProjectAndDesignation[project.id]?.[designation] || 75;
          
          if (!designationMap.has(designation)) {
            designationMap.set(designation, {
              hours,
              rate: hourlyRate,
              amount: hours * hourlyRate
            });
          } else {
            const existing = designationMap.get(designation)!;
            existing.hours += hours;
            existing.amount = existing.hours * existing.rate;
            designationMap.set(designation, existing);
          }
        });
        
        return {
          projectId: project.id,
          projectName: project.project_name,
          employees: Array.from(designationMap.entries()).map(([designation, data]) => ({
            designation,
            hours: data.hours,
            rate: data.rate,
            amount: data.amount
          }))
        };
      });
      
      const results = await Promise.all(timesheetsPromises);
      const validTimesheets = results.filter((timesheet): timesheet is ProjectTimesheet => 
        timesheet !== null && timesheet.employees.length > 0
      );
      
      const total = validTimesheets.reduce((sum, timesheet) => {
        const projectTotal = timesheet.employees.reduce((empSum, emp) => empSum + emp.amount, 0);
        return sum + projectTotal;
      }, 0);
      
      return {
        projectTimesheets: validTimesheets,
        totalAmount: total
      };
    },
    enabled: !!projects && projects.length > 0 && !!billingStart && !!billingEnd
  });

  return {
    projectTimesheets: data?.projectTimesheets || [],
    totalAmount: data?.totalAmount || 0
  };
};
