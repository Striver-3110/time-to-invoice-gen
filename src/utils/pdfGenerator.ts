
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';

export const generateInvoicePDF = async (invoice: any, lineItems: any[]) => {
  // Create the HTML content with proper styling
  const content = `
    <div id="invoice-pdf" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center;">
        <img src="/lovable-uploads/f307940b-4d67-475d-a872-cdef9d5d4060.png" alt="header" style="width: 200px; margin-bottom: 20px;" />
      </div>
      
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2 style="color: #333; margin: 0;">Invoice #${invoice.invoice_number}</h2>
            <p style="color: #666; margin: 5px 0;">Date: ${format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</p>
            <p style="color: #666; margin: 5px 0;">Due Date: ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="color: #333; margin: 0;">Status: ${invoice.status}</h3>
            <p style="color: #666; margin: 5px 0;">Amount: ${invoice.currency} ${invoice.total_amount.toFixed(2)}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="color: #333; margin-bottom: 10px;">Client Details</h3>
            <p style="margin: 5px 0;">${invoice.clients?.name}</p>
            <p style="margin: 5px 0;">${invoice.clients?.contact_email}</p>
          </div>
          <div>
            <h3 style="color: #333; margin-bottom: 10px;">Billing Period</h3>
            <p style="margin: 5px 0;">From: ${format(new Date(invoice.billing_period_start), 'MMM dd, yyyy')}</p>
            <p style="margin: 5px 0;">To: ${format(new Date(invoice.billing_period_end), 'MMM dd, yyyy')}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Project</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Employee</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Hours</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.service_description}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.projects?.project_name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.employees?.designation}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${invoice.currency} ${item.total_amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5;">
              <td colspan="4" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>${invoice.currency} ${invoice.total_amount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  // PDF generation options
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `invoice-${invoice.invoice_number}.pdf`,
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
    await html2pdf().from(element).set(opt).save();
  } finally {
    // Clean up the temporary element
    document.body.removeChild(element);
  }
};
