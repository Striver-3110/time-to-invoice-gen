
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, addDays } from "date-fns";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { 
  ArrowLeft, Calendar as CalendarIcon, Save 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  contact_email: string;
  contract_start_date: string;
  contract_end_date: string;
  status: string;
}

interface Project {
  id: string;
  project_name: string;
  client_id: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
  email: string;
  status: string;
}

interface Assignment {
  id: string;
  employee_id: string;
  project_id: string;
  employee?: {
    designation: string;
  };
}

interface TimeEntry {
  id: string;
  employee_id: string;
  project_id: string;
  date: string;
  hours: number;
  employee: Employee;
}

interface ProjectTimesheet {
  projectId: string;
  projectName: string;
  employees: {
    designation: string;
    hours: number;
    rate: number;
    amount: number;
  }[];
}

const ClientInvoiceGenerate = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [billingStart, setBillingStart] = useState<Date>(new Date(new Date().setDate(1))); // Start of current month
  const [billingEnd, setBillingEnd] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 15));
  const [projectTimesheets, setProjectTimesheets] = useState<ProjectTimesheet[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, Record<string, string>>>({});
  
  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch client information"
        });
        throw error;
      }
      
      return data as Client;
    }
  });
  
  // Fetch client's projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
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
      
      return data as Project[];
    },
    enabled: !!clientId
  });
  
  // Fetch assignments for all projects when projects are loaded
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
      
      // Create a map of project_id -> designation -> assignment_id
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
  
  // Generate timesheets when dates change or projects load
  useEffect(() => {
    if (!projects || !billingStart || !billingEnd) return;
    
    const generateTimesheets = async () => {
      const startDate = format(billingStart, 'yyyy-MM-dd');
      const endDate = format(billingEnd, 'yyyy-MM-dd');
      
      // Create a timesheet for each project
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
        
        // Group time entries by designation
        const designationMap = new Map<string, {
          hours: number;
          rate: number;
          amount: number;
        }>();
        
        timeEntries.forEach((entry: any) => {
          const designation = entry.employees.designation;
          const hours = entry.hours;
          // Standard rate of $75 per hour
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
      
      // Calculate total amount
      const total = validTimesheets.reduce((sum, timesheet) => {
        const projectTotal = timesheet.employees.reduce((empSum, emp) => empSum + emp.amount, 0);
        return sum + projectTotal;
      }, 0);
      
      setTotalAmount(total);
    };
    
    generateTimesheets();
  }, [projects, billingStart, billingEnd, toast, clientId]);
  
  const handleGenerateInvoice = async () => {
    if (projectTimesheets.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot create invoice",
        description: "No billable time entries found for the selected period."
      });
      return;
    }
    
    try {
      // Generate invoice number (YYYYMMDD-clientID-random)
      const invoiceNumber = `${format(new Date(), 'yyyyMMdd')}-${clientId?.substring(0, 8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          client_id: clientId,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString(),
          due_date: dueDate.toISOString(),
          total_amount: totalAmount,
          currency: 'USD',
          status: 'DRAFT',
          billing_period_start: billingStart.toISOString(),
          billing_period_end: billingEnd.toISOString()
        })
        .select()
        .single();
      
      if (invoiceError) throw new Error(invoiceError.message);
      
      // Create invoice line items
      const lineItems = [];
      
      for (const project of projectTimesheets) {
        for (const employee of project.employees) {
          // Get assignment ID from the map
          const assignmentId = assignmentMap[project.projectId]?.[employee.designation];
          
          if (!assignmentId) {
            toast({
              variant: "destructive",
              title: "Error",
              description: `No active assignment found for ${employee.designation} in project ${project.projectName}. Cannot create line item.`
            });
            continue;
          }
          
          // Find any employee with this designation for this project
          const { data: employeeData } = await supabase
            .from('assignments')
            .select('employee_id')
            .eq('id', assignmentId)
            .single();
            
          const employeeId = employeeData?.employee_id;
          
          lineItems.push({
            invoice_id: invoice.invoice_id,
            project_id: project.projectId,
            assignment_id: assignmentId,
            employee_id: employeeId,
            service_description: `${employee.designation} services - ${project.projectName}`,
            quantity: employee.hours,
            total_amount: employee.amount
          });
        }
      }
      
      if (lineItems.length === 0) {
        throw new Error("Could not create any invoice line items due to missing assignment data");
      }
      
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);
      
      if (lineItemsError) throw new Error(lineItemsError.message);
      
      toast({
        title: "Invoice Created",
        description: `Invoice #${invoiceNumber} has been created.`
      });
      
      // Navigate to the created invoice
      navigate(`/invoices/${invoice.invoice_id}`);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating invoice",
        description: error.message
      });
    }
  };
  
  if (isLoadingClient || isLoadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Client Not Found</h2>
        <Button onClick={() => navigate('/clients')}>Return to Clients</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/clients')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Generate Invoice</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Review client details before generating the invoice</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_name">Client Name</Label>
            <Input id="client_name" value={client.name} readOnly className="bg-muted/50" />
          </div>
          <div>
            <Label htmlFor="client_email">Client Email</Label>
            <Input id="client_email" value={client.contact_email} readOnly className="bg-muted/50" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Define the billing period and due date</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Billing Period Start</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !billingStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {billingStart ? format(billingStart, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={billingStart}
                  onSelect={(date) => date && setBillingStart(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Billing Period End</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !billingEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {billingEnd ? format(billingEnd, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={billingEnd}
                  onSelect={(date) => date && setBillingEnd(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Due Date (15 days from issue)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Entries by Project and Employee</CardTitle>
          <CardDescription>Billable hours for the selected period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {projectTimesheets.length > 0 ? (
            projectTimesheets.map((project) => (
              <div key={project.projectId} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{project.projectName}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Designation</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.employees.map((employee, idx) => (
                      <TableRow key={`${project.projectId}-${employee.designation}-${idx}`}>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>{employee.hours}</TableCell>
                        <TableCell>${employee.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${employee.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator className="my-4" />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No time entries found for the selected period. 
              Try adjusting the billing period dates.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <span className="text-lg font-medium">Total Amount</span>
          <span className="text-lg font-bold text-primary">${totalAmount.toFixed(2)}</span>
        </CardFooter>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate('/clients')}>
          Cancel
        </Button>
        <Button 
          onClick={handleGenerateInvoice} 
          disabled={projectTimesheets.length === 0}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>
    </div>
  );
};

export default ClientInvoiceGenerate;
