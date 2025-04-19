import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Send } from "lucide-react";
import { format } from "date-fns";
import { InvoiceStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/utils/pdfGenerator";

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return "bg-yellow-100 text-yellow-800";
    case InvoiceStatus.SENT:
      return "bg-blue-100 text-blue-800";
    case InvoiceStatus.PAID:
      return "bg-green-100 text-green-800";
    case InvoiceStatus.OVERDUE:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            contact_email
          )
        `)
        .eq('invoice_id', id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch invoice details"
        });
        throw error;
      }

      return data;
    },
    enabled: !!id
  });

  const { data: lineItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['invoice-line-items', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            designation
          ),
          projects (
            project_name
          )
        `)
        .eq('invoice_id', id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch invoice line items"
        });
        throw error;
      }

      return data;
    },
    enabled: !!id
  });

  const handleDownloadPDF = async () => {
    if (invoice && lineItems) {
      try {
        await generateInvoicePDF(invoice, lineItems);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF"
        });
      }
    }
  };

  const sendInvoiceToClient = async () => {
    if (!invoice || !lineItems) return;

    try {
      await generateInvoicePDF(invoice, lineItems);
      
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { invoice, lineItems },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice has been sent to the client",
      });

      // Refresh the invoice data to show updated status
      await refetch();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invoice to client",
      });
    }
  };

  if (isLoadingInvoice || isLoadingItems) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Invoice #{invoice.invoice_number}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status === InvoiceStatus.DRAFT && (
            <Button onClick={sendInvoiceToClient}>
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Status:</dt>
                <dd>
                  <Badge className={getStatusColor(invoice.status as InvoiceStatus)} variant="outline">
                    {invoice.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Invoice Date:</dt>
                <dd>{format(new Date(invoice.invoice_date), "MMM dd, yyyy")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Due Date:</dt>
                <dd>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</dd>
              </div>
              {invoice.payment_date && (
                <div className="flex justify-between">
                  <dt className="font-medium">Payment Date:</dt>
                  <dd>{format(new Date(invoice.payment_date), "MMM dd, yyyy")}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{invoice.clients?.name}</p>
            <p className="text-sm text-muted-foreground">{invoice.clients?.contact_email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Period</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Start Date:</dt>
                <dd>{format(new Date(invoice.billing_period_start), "MMM dd, yyyy")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">End Date:</dt>
                <dd>{format(new Date(invoice.billing_period_end), "MMM dd, yyyy")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.line_item_id}>
                  <TableCell>{item.service_description}</TableCell>
                  <TableCell>{item.projects?.project_name}</TableCell>
                  <TableCell>
                    {item.employees?.designation}
                  </TableCell>
                  <TableCell>{item.quantity} hours</TableCell>
                  <TableCell className="text-right">
                    {invoice.currency} {item.total_amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-4">
          <div className="text-right">
            <div className="flex justify-between w-64">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold">
                {invoice.currency} {invoice.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvoiceView;
