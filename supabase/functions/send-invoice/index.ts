
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Create a nicely formatted line items HTML
    const lineItemsHtml = lineItems.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.service_description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${item.total_amount.toFixed(2)}</td>
      </tr>
    `).join('');

    // Format dates for better readability
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Send email with invoice details
    const emailResponse = await resend.emails.send({
      from: "Invoicing System <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Invoice #${invoice.invoice_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #4338ca; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Invoice #${invoice.invoice_number}</h1>
          
          <div style="margin: 20px 0;">
            <p><strong>To:</strong> ${invoice.clients.name}</p>
            <p><strong>Date:</strong> ${formatDate(invoice.invoice_date)}</p>
            <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
            <p><strong>Billing Period:</strong> ${formatDate(invoice.billing_period_start)} to ${formatDate(invoice.billing_period_end)}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Service Description</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; font-weight: bold;">${invoice.currency} ${invoice.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p>Thank you for your business. Please make payment by the due date.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      `,
    });

    // Check for Resend testing mode limitations
    if (emailResponse.error) {
      // If this is the testing mode limitation error
      if (emailResponse.error.statusCode === 403 && emailResponse.error.message.includes("testing emails")) {
        const verifiedEmailMatch = emailResponse.error.message.match(/\(([^)]+)\)/);
        const verifiedEmail = verifiedEmailMatch ? verifiedEmailMatch[1] : "your verified email";
        
        return new Response(
          JSON.stringify({ 
            error: "Email sending limitation", 
            message: `Resend is in test mode. You can only send emails to ${verifiedEmail}. Please enter this email address or verify your domain at resend.com/domains.` 
          }),
          {
            status: 422, // Unprocessable Entity - client error
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw new Error(emailResponse.error.message);
    }

    // Only update invoice status if email was sent successfully
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'SENT' })
      .eq('invoice_id', invoice.invoice_id);

    if (updateError) {
      console.error("Error updating invoice status:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), {
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
