import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFromEmail) {
      console.warn('SMTP configuration is incomplete. Email sending will be disabled.');
      console.warn('Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465, // true for port 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          // Do not fail on invalid certs (useful for development)
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
      });

      console.log('Email transporter initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter is not initialized. Cannot send email.');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'DSHome'}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error: any) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendTestEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'SMTP configuration is not set up. Please configure SMTP settings in environment variables.',
      };
    }

    try {
      await this.sendEmail({ to, subject, html });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send test email',
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }

  getTestVariables(): Record<string, string> {
    return {
      shop_name: 'DSHome',
      shop_email: 'info@dshome.dev',
      shop_phone: '+359 123 456 789',
      shop_address: 'София, България',
      customer_first_name: 'Иван',
      customer_last_name: 'Иванов',
      customer_email: 'ivan.ivanov@example.com',
      customer_phone: '+359 888 123 456',
      order_reference: 'ORD-2025-001',
      order_date: new Date().toLocaleDateString('bg-BG'),
      order_status: 'В обработка',
      order_total: '150.00 EUR',
      order_items: '<ul><li>Продукт 1 - 50.00 EUR</li><li>Продукт 2 - 100.00 EUR</li></ul>',
      shipping_address: 'София, ул. Тестова 1',
      billing_address: 'София, ул. Тестова 1',
      tracking_number: 'TRACK123456',
      tracking_url: 'https://dshome.dev/tracking/TRACK123456',
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
