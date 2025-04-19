
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Send } from "lucide-react";
import { InvoiceStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { InvoiceDetailsCard } from "@/components/invoice/InvoiceDetailsCard";
import { ClientCard } from "@/components/invoice/ClientCard";
import { BillingPeriodCard } from "@/components/invoice/BillingPeriodCard";
import { InvoiceLineItemsTable } from "@/components/invoice/InvoiceLineItemsTable";

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: invoice, 
    isLoading: isLoadingInvoice,
    refetch: refetchInvoice
  } = useQuery({
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

      await refetchInvoice();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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
        <InvoiceDetailsCard invoice={invoice} />
        <ClientCard 
          name={invoice.clients?.name || ''} 
          email={invoice.clients?.contact_email || ''} 
        />
        <BillingPeriodCard 
          startDate={invoice.billing_period_start} 
          endDate={invoice.billing_period_end} 
        />
      </div>

      <InvoiceLineItemsTable 
        lineItems={lineItems} 
        currency={invoice.currency} 
        totalAmount={invoice.total_amount} 
      />
    </div>
  );
};

export default InvoiceView;
