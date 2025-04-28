
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice, lineItems, recipientEmail } = await req.json();
    
    // Initialize Resend with API key
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    if (!resend) {
      console.error("Resend API key not found");
      throw new Error("Email service configuration error");
    }

    // Format dates for better readability
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Create a nicely formatted line items HTML
    const lineItemsHtml = lineItems.map((item: any) => `
      <tr>
        <td>${item.service_description}</td>
        <td>${item.quantity}</td>
        <td>$${item.total_amount.toFixed(2)}</td>
      </tr>
    `).join('');

    // Create HTML email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 15px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
            .total { font-weight: bold; text-align: right; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Invoice #${invoice.invoiceNumber}</h2>
            </div>
            <div class="content">
              <p>Dear ${invoice.clients?.name || "Client"},</p>
              <p>Please find your invoice details below:</p>
              
              <p><strong>Invoice Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
              <p><strong>Billing Period:</strong> ${formatDate(invoice.billingPeriodStart)} to ${formatDate(invoice.billingPeriodEnd)}</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItemsHtml}
                </tbody>
              </table>
              
              <p class="total">Total Amount: ${invoice.currency} ${invoice.totalAmount.toFixed(2)}</p>
              
              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>This is an automatically generated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email to:", recipientEmail);

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'Invoicing <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `Invoice #${invoice.invoiceNumber}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", data);

    // Only update invoice status if email was sent successfully
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'SENT' })
      .eq('invoice_id', invoice.id);

    if (updateError) {
      console.error("Error updating invoice status:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
