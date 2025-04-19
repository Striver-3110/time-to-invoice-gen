
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';

export const generateInvoicePDF = async (invoice: any, lineItems: any[]) => {
  // Create the HTML content with proper styling
  const content = `
    <div id="invoice-pdf" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px 0; display: flex; justify-content: space-between; align-items: center;">
        <img src="https://i.ibb.co/Z6nDP1Fx/top.png" alt="Incubyte Logo" style="height: 60px; object-fit: contain;" />
        <div>
          <h1 style="color: #4f46e5; margin: 0;">INVOICE</h1>
          <p style="color: #666; margin: 5px 0;">#${invoice.invoice_number || invoice.invoiceNumber}</p>
        </div>
        <div style="width: 60px;"></div>
      </div>
      
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2 style="color: #4f46e5; margin: 0;">Invoice Details</h2>
            <p style="color: #666; margin: 5px 0;">Date: ${format(new Date(invoice.invoice_date || invoice.invoiceDate), 'MMM dd, yyyy')}</p>
            <p style="color: #666; margin: 5px 0;">Due Date: ${format(new Date(invoice.due_date || invoice.dueDate), 'MMM dd, yyyy')}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="color: #4f46e5; margin: 0;">Status: ${invoice.status}</h3>
            <p style="color: #666; margin: 5px 0;">Amount: ${invoice.currency} ${(invoice.total_amount || invoice.totalAmount).toFixed(2)}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="color: #4f46e5; margin-bottom: 10px;">Client Details</h3>
            <p style="margin: 5px 0;">${(invoice.clients?.name || '')}</p>
            <p style="margin: 5px 0;">${(invoice.clients?.contact_email || '')}</p>
          </div>
          <div>
            <h3 style="color: #4f46e5; margin-bottom: 10px;">Billing Period</h3>
            <p style="margin: 5px 0;">From: ${format(new Date(invoice.billing_period_start || invoice.billingPeriodStart), 'MMM dd, yyyy')}</p>
            <p style="margin: 5px 0;">To: ${format(new Date(invoice.billing_period_end || invoice.billingPeriodEnd), 'MMM dd, yyyy')}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Project</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Employee</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Hours</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.service_description || item.serviceDescription}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.projects?.project_name || ''}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.employees?.designation || ''}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${invoice.currency} ${((item.total_amount || item.totalAmount) / item.quantity).toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${invoice.currency} ${(item.total_amount || item.totalAmount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5;">
              <td colspan="5" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>${invoice.currency} ${(invoice.total_amount || invoice.totalAmount).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666;">Thank you for your business. Payment is due by ${format(new Date(invoice.due_date || invoice.dueDate), 'MMM dd, yyyy')}</p>
        </div>
      </div>
    </div>
  `;

  // PDF generation options
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `invoice-${invoice.invoice_number || invoice.invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      letterRendering: true,
      useCORS: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait'
    }
  };

  // Create a temporary div to hold the content
  const element = document.createElement('div');
  element.innerHTML = content;
  document.body.appendChild(element);

  try {
    const pdf = await html2pdf().from(element).set(opt).save();
    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    document.body.removeChild(element);
  }
};
