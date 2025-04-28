
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Prepare email data with your EmailJS credentials
    const emailData = {
      service_id: "service_2ty5cia",
      template_id: "template_5dp51gk",
      user_id: "XZjPDxTgi90v1yY24",
      accessToken: "JU0CCwxaSJeClHNB9fReu",
      template_params: {
        to_email: recipientEmail,
        invoice_number: invoice.invoice_number,
        client_name: invoice.clients.name,
        invoice_date: formatDate(invoice.invoice_date),
        due_date: formatDate(invoice.due_date),
        billing_period_start: formatDate(invoice.billing_period_start),
        billing_period_end: formatDate(invoice.billing_period_end),
        line_items_html: lineItemsHtml,
        currency: invoice.currency,
        total_amount: invoice.total_amount.toFixed(2)
      }
    };

    // Send email using EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("EmailJS error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    console.log("Email sent successfully to:", recipientEmail);

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
