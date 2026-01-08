const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email Service Configuration
 * Configures Nodemailer for Gmail SMTP
 */

class EmailConfig {
  constructor() {
    this.transporter = null;
    this.emailEnabled = process.env.EMAIL_ENABLED === 'true';
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    if (!this.emailEnabled) {
      logger.info('📧 Email service is disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('❌ Email service configuration error:', error);
        } else {
          logger.info('✅ Email service is ready to send messages');
        }
      });
    } catch (error) {
      logger.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Get transporter instance
   */
  getTransporter() {
    return this.transporter;
  }

  /**
   * Check if email is enabled
   */
  isEnabled() {
    return this.emailEnabled;
  }

  /**
   * Get sender information
   */
  getSenderInfo() {
    return {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME || 'WLAN Corporation',
    };
  }

  /**
   * Send email
   * @param {Object} mailOptions - Email options (to, subject, html, text)
   */
  async sendMail(mailOptions) {
    if (!this.emailEnabled) {
      logger.warn('Email service is disabled. Email not sent.');
      return { success: false, message: 'Email service is disabled' };
    }

    if (!this.transporter) {
      logger.error('Email transporter not initialized');
      return { success: false, message: 'Email transporter not initialized' };
    }

    try {
      const senderInfo = this.getSenderInfo();
      const options = {
        from: `"${senderInfo.name}" <${senderInfo.email}>`,
        ...mailOptions,
      };

      const info = await this.transporter.sendMail(options);
      logger.info(`✅ Email sent successfully: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }
}

module.exports = new EmailConfig();
