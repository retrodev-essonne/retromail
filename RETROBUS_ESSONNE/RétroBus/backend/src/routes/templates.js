import express from 'express';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * GET /api/templates
 * Récupère tous les templates d'emails disponibles
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'welcome',
        name: 'Bienvenue',
        subject: 'Bienvenue sur RétroBus Mail',
        body: '<h1>Bienvenue</h1><p>Merci de vous être inscrit.</p>'
      },
      {
        id: 'password_reset',
        name: 'Réinitialiser le mot de passe',
        subject: 'Réinitialiser votre mot de passe',
        body: '<h1>Réinitialisation</h1><p>Cliquez <a href="{reset_link}">ici</a> pour réinitialiser.</p>'
      },
      {
        id: 'event_notification',
        name: 'Notification d\'événement',
        subject: 'Nouvel événement RétroBus',
        body: '<h1>Événement</h1><p>Un nouvel événement a été créé: {event_name}</p>'
      },
      {
        id: 'maintenance_alert',
        name: 'Alerte maintenance',
        subject: 'Alerte maintenance véhicule',
        body: '<h1>Maintenance</h1><p>Maintenance requise pour: {vehicle_name}</p>'
      }
    ];

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Templates fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * GET /api/templates/:id
 * Récupère un template spécifique
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Récupérer depuis la BD
    const template = null;

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error('Template fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * POST /api/templates
 * Crée un nouveau template
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, subject, body, category = 'custom' } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Sauvegarder dans la BD

    res.json({ 
      success: true, 
      template: {
        id: 'new-id',
        name,
        subject,
        body,
        category,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Template creation error:', error.message);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /api/templates/:id
 * Met à jour un template
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body } = req.body;

    // TODO: Mettre à jour dans la BD

    res.json({ 
      success: true, 
      template: { id, name, subject, body }
    });
  } catch (error) {
    console.error('Template update error:', error.message);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /api/templates/:id
 * Supprime un template
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Supprimer de la BD

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Template deletion error:', error.message);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
