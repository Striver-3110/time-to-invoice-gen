
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const { invoice, lineItems, pdfUrl } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Send email with invoice details
    const emailResponse = await resend.emails.send({
      from: "Invoicing System <onboarding@resend.dev>",
      to: [invoice.clients.contact_email],
      subject: `Invoice #${invoice.invoice_number}`,
      html: `
        <h1>Invoice #${invoice.invoice_number}</h1>
        <p>Dear ${invoice.clients.name},</p>
        <p>Please find attached your invoice for the period ${invoice.billing_period_start} to ${invoice.billing_period_end}.</p>
        <p>Total Amount: ${invoice.currency} ${invoice.total_amount.toFixed(2)}</p>
        <p>Due Date: ${invoice.due_date}</p>
        <p>Please don't hesitate to contact us if you have any questions.</p>
      `,
    });

    // Update invoice status to SENT
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'SENT' })
      .eq('invoice_id', invoice.invoice_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
