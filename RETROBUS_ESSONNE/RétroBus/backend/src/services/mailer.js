import nodemailer from 'nodemailer';

/**
 * Service pour envoyer des emails via SMTP
 */
class MailerService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialise le transporteur nodemailer
   */
  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Tester la connexion
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection failed:', error.message);
      } else {
        console.log('✅ SMTP connection established');
      }
    });
  }

  /**
   * Envoie un email
   * @param {Object} options - { from, to, cc, bcc, subject, html, text }
   * @returns {Promise<Object>} - Résultat d'envoi
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM_EMAIL,
        to: options.to,
        cc: options.cc || null,
        bcc: options.bcc || null,
        subject: options.subject,
        html: options.html,
        text: options.text || null
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      throw error;
    }
  }

  /**
   * Envoie un email à partir d'un template
   * @param {Object} options - { to, template, variables, subject }
   * @returns {Promise<Object>}
   */
  async sendEmailFromTemplate(options) {
    const { to, template, variables = {}, subject } = options;

    let htmlContent = template;
    // Remplacer les variables du template
    Object.entries(variables).forEach(([key, value]) => {
      htmlContent = htmlContent.replace(`{${key}}`, value);
    });

    return this.sendEmail({
      to,
      subject,
      html: htmlContent
    });
  }

  /**
   * Envoie un email de notification (ex: nouvel événement)
   */
  async sendEventNotification(userEmail, eventData) {
    const template = `
      <h2>${eventData.title}</h2>
      <p>${eventData.description}</p>
      <p><strong>Date:</strong> ${eventData.date}</p>
      <p><strong>Lieu:</strong> ${eventData.location}</p>
      <a href="${eventData.link}">Voir l'événement</a>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Nouvel événement: ${eventData.title}`,
      html: template
    });
  }

  /**
   * Envoie une alerte de maintenance
   */
  async sendMaintenanceAlert(userEmail, vehicleData) {
    const template = `
      <h2>Alerte maintenance</h2>
      <p>Maintenance requise pour le véhicule <strong>${vehicleData.name}</strong></p>
      <p><strong>Type:</strong> ${vehicleData.maintenanceType}</p>
      <p><strong>Date prévue:</strong> ${vehicleData.scheduledDate}</p>
      <p><strong>Priorité:</strong> ${vehicleData.priority}</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Alerte maintenance: ${vehicleData.name}`,
      html: template
    });
  }

  /**
   * Synchronise les emails depuis IMAP (stub - à implémenter)
   */
  async syncEmails(userEmail) {
    // TODO: Implémenter la synchronisation IMAP
    // Pour l'instant, retourner un objet vide
    return { count: 0, lastSync: new Date().toISOString() };
  }
}

export default new MailerService();
