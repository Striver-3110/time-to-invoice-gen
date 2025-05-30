
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { InvoiceStatus, type Invoice } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { InvoiceDetailsCard } from "@/components/invoice/InvoiceDetailsCard";
import { ClientCard } from "@/components/invoice/ClientCard";
import { BillingPeriodCard } from "@/components/invoice/BillingPeriodCard";
import { InvoiceLineItemsTable } from "@/components/invoice/InvoiceLineItemsTable";
import { isPast } from "date-fns";
import { PaymentDialog } from "@/components/invoice/PaymentDialog";
import { SendInvoiceDialog } from "@/components/invoice/SendInvoiceDialog";
import { useState } from "react";

interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  assignmentId: string;
  employeeId: string;
  projectId: string;
  serviceDescription: string;
  quantity: number;
  totalAmount: number;
}

const transformInvoiceData = (data: any): Invoice => {
  return {
    id: data.invoice_id,
    clientId: data.client_id,
    invoiceNumber: data.invoice_number,
    invoiceDate: new Date(data.invoice_date),
    dueDate: new Date(data.due_date),
    paymentDate: data.payment_date ? new Date(data.payment_date) : undefined,
    totalAmount: data.total_amount,
    currency: data.currency,
    status: data.status as InvoiceStatus,
    billingPeriodStart: new Date(data.billing_period_start),
    billingPeriodEnd: new Date(data.billing_period_end),
  };
};

const transformLineItemData = (data: any[]): InvoiceLineItem[] => {
  return data.map(item => ({
    id: item.line_item_id,
    invoiceId: item.invoice_id,
    assignmentId: item.assignment_id,
    employeeId: item.employee_id,
    projectId: item.project_id,
    serviceDescription: item.service_description,
    quantity: item.quantity,
    totalAmount: item.total_amount,
  }));
};

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { 
    data: rawInvoiceData, 
    isLoading: isLoadingInvoice,
    refetch: refetchInvoice
  } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data: invoice, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError;

      if (invoice.status === InvoiceStatus.SENT && 
          isPast(new Date(invoice.due_date)) && 
          !invoice.payment_date) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ status: InvoiceStatus.OVERDUE })
          .eq('invoice_id', id);

        if (updateError) throw updateError;
        
        return {
          ...invoice,
          status: InvoiceStatus.OVERDUE
        };
      }

      return invoice;
    },
    enabled: !!id
  });

  const handleMarkAsPaid = async (invoiceId: string, paymentDate: Date) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: InvoiceStatus.PAID,
          payment_date: paymentDate.toISOString()
        })
        .eq('invoice_id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice has been marked as paid",
      });

      await refetchInvoice();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark invoice as paid",
      });
    }
  };

  const sendInvoice = async (email: string) => {
    setIsSending(true);
    
    try {
      const dataToSend = {
        invoice: invoice,
        lineItems: lineItems,
        recipientEmail: email
      };
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://oxoiambekglszdukupem.supabase.co"}/functions/v1/send-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94b2lhbWJla2dsc3pkdWt1cGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDIzNDYsImV4cCI6MjA2MDYxODM0Nn0.pmQFGkY3ikWz_xI6rxZadLPWKO7cP4-aTkehoFGGtD0"}`
          },
          body: JSON.stringify(dataToSend)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send invoice: ${errorData}`);
      }
      
      toast({
        title: "Invoice Sent",
        description: `Invoice successfully sent to ${email}`,
      });
      
      await queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      
    } catch (error: any) {
      console.error("Error sending invoice:", error);
      toast({
        variant: "destructive",
        title: "Failed to send invoice",
        description: error.message || "An unexpected error occurred",
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const { data: lineItemsRaw = [], isLoading: isLoadingItems } = useQuery({
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

  const invoice = rawInvoiceData ? transformInvoiceData(rawInvoiceData) : null;
  const lineItems = lineItemsRaw || [];

  const handleDownloadPDF = async () => {
    if (invoice && lineItems) {
      try {
        setIsGeneratingPdf(true);
        await generateInvoicePDF(rawInvoiceData, lineItemsRaw);
        toast({
          title: "Success",
          description: "PDF has been generated and downloaded",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF. Please try again."
        });
      } finally {
        setIsGeneratingPdf(false);
      }
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

  // Determine if we should show the send button based on status
  const showSendButton = invoice.status !== InvoiceStatus.PAID;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Invoice #{invoice.invoiceNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF} 
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
          {showSendButton && (
            <SendInvoiceDialog 
              defaultEmail={rawInvoiceData?.clients?.contact_email || ''}
              onSendEmail={sendInvoice}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <InvoiceDetailsCard invoice={invoice} />
        <ClientCard 
          name={rawInvoiceData?.clients?.name || ''} 
          email={rawInvoiceData?.clients?.contact_email || ''} 
        />
        <BillingPeriodCard 
          startDate={invoice.billingPeriodStart.toISOString()} 
          endDate={invoice.billingPeriodEnd.toISOString()} 
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">Line Items</h2>
        {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
          <PaymentDialog
            invoiceId={invoice.id}
            onPaymentSubmit={(date) => handleMarkAsPaid(invoice.id, date)}
          />
        )}
      </div>

      <InvoiceLineItemsTable 
        lineItems={lineItemsRaw} 
        currency={invoice.currency} 
        totalAmount={invoice.totalAmount} 
      />
    </div>
  );
};

export default InvoiceView;
