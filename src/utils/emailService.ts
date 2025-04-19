
import emailjs from '@emailjs/browser';

interface SendInvoiceEmailParams {
  to_email: string;
  to_name: string;
  invoice_number: string;
  invoice_amount: string;
  due_date: string;
}

export const sendInvoiceEmail = async (params: SendInvoiceEmailParams) => {
  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      params,
      {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        privateKey: import.meta.env.VITE_EMAILJS_PRIVATE_KEY,
      }
    );
    
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
