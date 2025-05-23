import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";
import { InvoiceStatus } from "@/lib/types";
import { InvoiceStatusBadge } from "@/components/invoice/InvoiceStatusBadge";
import { PaymentDialog } from "@/components/invoice/PaymentDialog";
import { toast } from "@/components/ui/sonner";

const Invoices = () => {
  const queryClient = useQueryClient();

  const { data: invoiceList = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          invoice_id,
          invoice_number,
          invoice_date,
          due_date,
          payment_date,
          total_amount,
          currency,
          status,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(invoice => ({
        ...invoice,
        status: isPast(new Date(invoice.due_date)) && invoice.status === InvoiceStatus.SENT 
          ? InvoiceStatus.OVERDUE 
          : invoice.status
      }));
    },
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

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Invoice marked as paid");
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error("Failed to mark invoice as paid");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Invoices</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceList.map((invoice: any) => (
                <TableRow key={invoice.invoice_id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.clients?.name}</TableCell>
                  <TableCell>{format(new Date(invoice.invoice_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {invoice.payment_date 
                      ? format(new Date(invoice.payment_date), "MMM dd, yyyy")
                      : "--"}
                  </TableCell>
                  <TableCell>{invoice.currency} {invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && !invoice.payment_date && (
                        <PaymentDialog
                          invoiceId={invoice.invoice_id}
                          onPaymentSubmit={(date) => handleMarkAsPaid(invoice.invoice_id, date)}
                        />
                      )}
                      <Link to={`/invoices/${invoice.invoice_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoiceList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No invoices found. Generate an invoice from the client page.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
