import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@guiltlesscakes.com';
const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Guiltless Cakes';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: `${businessName} <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmation({
  to,
  orderNumber,
  items,
  total,
  pickupDate,
  pickupWindow,
  pickupAddress,
}: {
  to: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  pickupDate: string;
  pickupWindow: string;
  pickupAddress: string;
}) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f9a8d4; }
        .header h1 { color: #db2777; margin: 0; }
        .content { padding: 20px 0; }
        .order-details { background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .pickup-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 18px; font-weight: bold; color: #db2777; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order</p>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>We've received your order and we're excited to prepare your treats!</p>

          <div class="order-details">
            <h3 style="margin-top: 0;">Order #${orderNumber}</h3>
            <table>
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                  <td class="total" style="padding: 8px; text-align: right;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="pickup-info">
            <h3 style="margin-top: 0;">Pickup Information</h3>
            <p><strong>Date:</strong> ${pickupDate}</p>
            <p><strong>Time:</strong> ${pickupWindow}</p>
            <p><strong>Location:</strong> ${pickupAddress}</p>
          </div>

          <p>We'll send you a reminder the day before pickup. If you need to make any changes to your order, please contact us at least 24 hours before your pickup time.</p>
        </div>
        <div class="footer">
          <p>${businessName}</p>
          <p>Made with love in Northeast Philadelphia</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmed - ${orderNumber} | ${businessName}`,
    html,
  });
}

export async function sendPickupReminder({
  to,
  orderNumber,
  pickupDate,
  pickupWindow,
  pickupAddress,
  isThursdayReminder = true,
}: {
  to: string;
  orderNumber: string;
  pickupDate: string;
  pickupWindow: string;
  pickupAddress: string;
  isThursdayReminder?: boolean;
}) {
  const subject = isThursdayReminder
    ? `Pickup Tomorrow - ${orderNumber}`
    : `Pickup Today - ${orderNumber}`;

  const timeText = isThursdayReminder ? 'tomorrow' : 'today';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f9a8d4; }
        .header h1 { color: #db2777; margin: 0; }
        .pickup-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pickup Reminder</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>Just a friendly reminder that your order #${orderNumber} is ready for pickup ${timeText}!</p>

          <div class="pickup-info">
            <h3 style="margin-top: 0;">Pickup Details</h3>
            <p><strong>Date:</strong> ${pickupDate}</p>
            <p><strong>Time:</strong> ${pickupWindow}</p>
            <p><strong>Location:</strong> ${pickupAddress}</p>
          </div>

          <p>When you arrive, please ring the doorbell or text us to let us know you're here.</p>
          <p>See you soon!</p>
        </div>
        <div class="footer">
          <p>${businessName}</p>
          <p>Made with love in Northeast Philadelphia</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${subject} | ${businessName}`,
    html,
  });
}

export async function sendInquiryConfirmation({
  to,
  eventType,
  eventDate,
}: {
  to: string;
  eventType: string;
  eventDate: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f9a8d4; }
        .header h1 { color: #db2777; margin: 0; }
        .content { padding: 20px 0; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Custom Cake Inquiry Received</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>Thank you for your custom cake inquiry for your ${eventType}!</p>
          <p>We've received your request for an event on ${eventDate}. Our team will review your inquiry and get back to you within 2-3 business days with a quote.</p>
          <p>If you have any questions in the meantime, feel free to reply to this email.</p>
          <p>We're excited to help make your celebration special!</p>
        </div>
        <div class="footer">
          <p>${businessName}</p>
          <p>Made with love in Northeast Philadelphia</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Custom Cake Inquiry Received | ${businessName}`,
    html,
  });
}

export async function sendAdminNotification({
  subject,
  content,
}: {
  subject: string;
  content: string;
}) {
  const adminEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'hello@guiltlesscakes.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #db2777; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Admin Notification</h1>
        </div>
        <div class="content">
          ${content}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Admin] ${subject} | ${businessName}`,
    html,
  });
}
