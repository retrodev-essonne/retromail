import express from 'express';
import { authenticateToken } from './auth.js';
import mailerService from '../services/mailer.js';

const router = express.Router();

/**
 * GET /api/mail/inbox
 * Récupère les emails reçus
 */
router.get('/inbox', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // TODO: Récupérer depuis la BD ou depuis IMAP
    const emails = [];

    res.json({
      success: true,
      emails,
      total: emails.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Inbox error:', error.message);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

/**
 * GET /api/mail/email/:id
 * Récupère un email spécifique
 */
router.get('/email/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Récupérer depuis la BD
    const email = null;

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ success: true, email });
  } catch (error) {
    console.error('Email fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

/**
 * POST /api/mail/send
 * Envoie un email
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, body, cc, bcc } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await mailerService.sendEmail({
      from: req.user.email,
      to,
      cc,
      bcc,
      subject,
      html: body
    });

    res.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Send email error:', error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

/**
 * POST /api/mail/reply
 * Répond à un email
 */
router.post('/reply', authenticateToken, async (req, res) => {
  try {
    const { originalEmailId, subject, body, cc, bcc } = req.body;

    // TODO: Récupérer le mail original et extraire le sender

    const result = await mailerService.sendEmail({
      from: req.user.email,
      to: '', // TODO: extraire du mail original
      cc,
      bcc,
      subject: `Re: ${subject}`,
      html: body
    });

    res.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Reply email error:', error.message);
    res.status(500).json({ error: 'Failed to reply to email' });
  }
});

/**
 * DELETE /api/mail/email/:id
 * Supprime un email
 */
router.delete('/email/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Marquer comme supprimé dans la BD

    res.json({ success: true, message: 'Email deleted' });
  } catch (error) {
    console.error('Delete email error:', error.message);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

/**
 * POST /api/mail/sync
 * Synchronise les emails depuis le serveur IMAP
 */
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    // TODO: Implemet IMAP sync depuis le serveur mail
    const syncResult = await mailerService.syncEmails(req.user.email);

    res.json({ 
      success: true, 
      synced: syncResult.count,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync error:', error.message);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
});

export default router;
