
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon, Trash, ArrowLeft, Plus, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { 
  clients, projects, employees, timeEntries, generateInvoiceNumber 
} from "@/lib/mock-data";
import { Client, Employee, Project, TimeEntry } from "@/lib/types";

// Invoice generation schema
const invoiceFormSchema = z.object({
  clientId: z.string().min(1, { message: "Client is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  invoiceDate: z.date({ required_error: "Invoice date is required" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  billingPeriodStart: z.date({ required_error: "Billing period start is required" }),
  billingPeriodEnd: z.date({ required_error: "Billing period end is required" }),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface LineItem {
  employeeId: string;
  projectId: string;
  hours: number;
  rate: number;
  amount: number;
  description: string;
}

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [relevantTimeEntries, setRelevantTimeEntries] = useState<TimeEntry[]>([]);

  // Set up form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      currency: "USD",
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      billingPeriodStart: new Date(new Date().setDate(1)), // First day of current month
      billingPeriodEnd: new Date(), // Today
    },
  });

  // Watch the form values to react to changes
  const watchClientId = form.watch("clientId");
  const watchBillingPeriodStart = form.watch("billingPeriodStart");
  const watchBillingPeriodEnd = form.watch("billingPeriodEnd");

  // Update selected client and relevant projects when client selection changes
  useEffect(() => {
    if (watchClientId) {
      const client = clients.find((c) => c.id === watchClientId);
      setSelectedClient(client || null);

      // Filter projects for this client
      const clientProjects = projects.filter((p) => p.clientId === watchClientId);
      setSelectedProjects(clientProjects);
    } else {
      setSelectedClient(null);
      setSelectedProjects([]);
    }

    // Reset line items when client changes
    setLineItems([]);
  }, [watchClientId]);

  // Update relevant time entries when billing period or projects change
  useEffect(() => {
    if (watchBillingPeriodStart && watchBillingPeriodEnd && selectedProjects.length > 0) {
      const projectIds = selectedProjects.map((p) => p.id);
      const filteredEntries = timeEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          projectIds.includes(entry.projectId) &&
          entryDate >= watchBillingPeriodStart &&
          entryDate <= watchBillingPeriodEnd
        );
      });
      setRelevantTimeEntries(filteredEntries);
    } else {
      setRelevantTimeEntries([]);
    }
  }, [watchBillingPeriodStart, watchBillingPeriodEnd, selectedProjects]);

  // Generate line items from time entries
  const generateLineItems = () => {
    // Group entries by employee and project
    const entriesByEmployeeAndProject: Record<string, Record<string, TimeEntry[]>> = {};
    
    relevantTimeEntries.forEach((entry) => {
      if (!entriesByEmployeeAndProject[entry.employeeId]) {
        entriesByEmployeeAndProject[entry.employeeId] = {};
      }
      
      if (!entriesByEmployeeAndProject[entry.employeeId][entry.projectId]) {
        entriesByEmployeeAndProject[entry.employeeId][entry.projectId] = [];
      }
      
      entriesByEmployeeAndProject[entry.employeeId][entry.projectId].push(entry);
    });
    
    // Create line items
    const newLineItems: LineItem[] = [];
    
    for (const employeeId in entriesByEmployeeAndProject) {
      const employee = employees.find((e) => e.id === employeeId);
      if (!employee) continue;
      
      for (const projectId in entriesByEmployeeAndProject[employeeId]) {
        const project = projects.find((p) => p.id === projectId);
        if (!project) continue;
        
        const entries = entriesByEmployeeAndProject[employeeId][projectId];
        const totalHours = entries.reduce((total, entry) => total + entry.hours, 0);
        
        // Set rate based on employee designation (simplified example)
        let hourlyRate = 100; // Default rate
        if (employee.designation.includes("Senior")) {
          hourlyRate = 200;
        } else if (employee.designation.includes("Manager")) {
          hourlyRate = 250;
        }
        
        const amount = totalHours * hourlyRate;
        
        newLineItems.push({
          employeeId,
          projectId,
          hours: totalHours,
          rate: hourlyRate,
          amount,
          description: `${employee.designation} Services - ${project.projectName}`,
        });
      }
    }
    
    setLineItems(newLineItems);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };
  
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.projectName || "Unknown";
  };
  
  const calculateTotal = (): number => {
    return lineItems.reduce((total, item) => total + item.amount, 0);
  };
  
  const onSubmit = (data: InvoiceFormValues) => {
    if (lineItems.length === 0) {
      alert("You must add at least one line item to create an invoice.");
      return;
    }
    
    const invoiceData = {
      ...data,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount: calculateTotal(),
      lineItems: lineItems,
    };
    
    console.log("Creating invoice:", invoiceData);
    // In a real app, here we would save the invoice to the database
    
    // Navigate back to invoices list
    navigate("/invoices");
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Generate New Invoice</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Basic invoice information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients
                            .filter(client => client.status === "ACTIVE")
                            .map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Invoice Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing Period</CardTitle>
                <CardDescription>Define the period for time entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingPeriodStart"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>From</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingPeriodEnd"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>To</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={generateLineItems}
                  disabled={!selectedClient || selectedProjects.length === 0}
                  className="w-full"
                >
                  Generate Line Items from Time Entries
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Line Items</CardTitle>
              <CardDescription>Services to be billed on this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              {lineItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{getProjectName(item.projectId)}</TableCell>
                        <TableCell>{getEmployeeName(item.employeeId)}</TableCell>
                        <TableCell>{item.hours}</TableCell>
                        <TableCell>{form.getValues("currency")} {item.rate}</TableCell>
                        <TableCell className="text-right">
                          {form.getValues("currency")} {item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setLineItems(lineItems.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedClient ? 
                    "Click 'Generate Line Items from Time Entries' to create invoice items." : 
                    "Select a client and define billing period to generate line items."
                  }
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div>
                {lineItems.length > 0 && (
                  <div className="text-muted-foreground">
                    {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex justify-between w-64">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold">
                    {form.getValues("currency")} {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={lineItems.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InvoiceCreate;
