import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillingPeriodSelector } from "@/components/invoice/BillingPeriodSelector";
import { TimesheetTable } from "@/components/invoice/TimesheetTable";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";

const ClientInvoiceGenerate = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [billingStart, setBillingStart] = useState<Date>(new Date(new Date().setDate(1)));
  const [billingEnd, setBillingEnd] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 15));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { projectTimesheets, totalAmount, assignmentMap, employeeMap } = useInvoiceGeneration(
    clientId,
    billingStart,
    billingEnd
  );

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
      
      return data;
    }
  });

  const handleGenerateInvoice = async () => {
    if (projectTimesheets.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot create invoice",
        description: "No billable time entries found for the selected period."
      });
      return;
    }
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const invoiceNumber = `${new Date().toISOString().slice(0, 10)}-${clientId?.substring(0, 8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // First create the invoice
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
      
      // Create line items for each project and employee
      const lineItems = projectTimesheets.flatMap(project => 
        project.employees.map(employee => {
          // Get employee ID from the designation
          const employeeId = employeeMap[employee.designation];
          
          if (!employeeId) {
            throw new Error(`Employee with designation ${employee.designation} not found.`);
          }
          
          return {
            invoice_id: invoice.invoice_id,
            project_id: project.projectId,
            assignment_id: assignmentMap[project.projectId]?.[employee.designation],
            employee_id: employeeId,
            service_description: `${employee.designation} services - ${project.projectName}`,
            quantity: employee.hours,
            total_amount: employee.amount
          };
        })
      );
      
      // Insert all line items
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);
      
      if (lineItemsError) throw new Error(lineItemsError.message);
      
      // Show success message
      toast({
        title: "Invoice Created",
        description: `Invoice #${invoiceNumber} has been created.`,
        className: "bg-green-500 text-white border-green-600",
      });
      
      // Navigate to the invoice view
      navigate(`/invoices/${invoice.invoice_id}`);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating invoice",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingClient) {
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
        <CardContent>
          <BillingPeriodSelector
            billingStart={billingStart}
            billingEnd={billingEnd}
            dueDate={dueDate}
            setBillingStart={setBillingStart}
            setBillingEnd={setBillingEnd}
            setDueDate={setDueDate}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Entries by Project and Employee</CardTitle>
          <CardDescription>Billable hours for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {projectTimesheets.length > 0 ? (
            <TimesheetTable projectTimesheets={projectTimesheets} />
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
          disabled={projectTimesheets.length === 0 || isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Generating...' : 'Generate Invoice'}
        </Button>
      </div>
    </div>
  );
};

export default ClientInvoiceGenerate;
