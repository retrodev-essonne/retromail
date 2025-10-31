import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authentifie un utilisateur RétroBus et retourne un JWT
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Vérifier auprès de l'API RétroBus
    const retroBusResponse = await axios.post(
      `${process.env.RETROBUS_API_URL}/auth/login`,
      { email, password },
      { headers: { 'Authorization': `Bearer ${process.env.RETROBUS_API_KEY}` } }
    );

    if (!retroBusResponse.data.success) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = retroBusResponse.data.user;

    // Générer JWT pour RétroBus Mail
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * POST /api/auth/verify
 * Vérifie un JWT valide
 */
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * GET /api/auth/profile
 * Récupère le profil de l'utilisateur connecté
 */
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// === MIDDLEWARE ===
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default router;
