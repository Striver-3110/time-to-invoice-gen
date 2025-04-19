
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { ProjectTimesheet } from "@/types/invoice";

export const useInvoiceGeneration = (clientId: string | undefined, billingStart: Date, billingEnd: Date) => {
  const { toast } = useToast();
  const [projectTimesheets, setProjectTimesheets] = useState<ProjectTimesheet[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, Record<string, string>>>({});

  // Fetch client projects
  const { data: projects } = useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch projects"
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!clientId
  });

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!projects || projects.length === 0) return;
      
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
        return;
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
      
      setAssignmentMap(newAssignmentMap);
    };
    
    fetchAssignments();
  }, [projects, toast]);

  // Generate timesheets
  useEffect(() => {
    if (!projects || !billingStart || !billingEnd) return;
    
    const generateTimesheets = async () => {
      const startDate = format(billingStart, 'yyyy-MM-dd');
      const endDate = format(billingEnd, 'yyyy-MM-dd');
      
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
          const hourlyRate = 75;
          
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
      
      setProjectTimesheets(validTimesheets);
      
      const total = validTimesheets.reduce((sum, timesheet) => {
        const projectTotal = timesheet.employees.reduce((empSum, emp) => empSum + emp.amount, 0);
        return sum + projectTotal;
      }, 0);
      
      setTotalAmount(total);
    };
    
    generateTimesheets();
  }, [projects, billingStart, billingEnd, toast]);

  return {
    projectTimesheets,
    totalAmount,
    assignmentMap
  };
};
