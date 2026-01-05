import jwt from 'jsonwebtoken';
import { query } from './lib/db.js';

function verifyAuth(req) {
  const token =
    req.cookies?.auth_token ||
    req.headers.authorization?.split(' ')[1];

  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;

    if (req.method === 'GET') {
      if (!id) {
        return res.status(400).json({ error: 'ID required' });
      }

      const result = await query(
        'SELECT * FROM certificates WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
      }

      return res.status(200).json({
        success: true,
        certificate: result.rows[0]
      });
    }

    verifyAuth(req);

    if (req.method === 'POST') {
      const { title, thumbnail_url, pdf_url, issuer } = req.body;

      if (!title || !thumbnail_url || !pdf_url) {
        return res.status(400).json({
          error: 'Title, thumbnail_url, and pdf_url required'
        });
      }

      const result = await query(
        `INSERT INTO certificates (title, thumbnail_url, pdf_url, issuer)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [title, thumbnail_url, pdf_url, issuer || null]
      );

      return res.status(201).json({
        success: true,
        certificate: result.rows[0]
      });
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'ID required' });
      }

      const { title, thumbnail_url, pdf_url, issuer, display_order } = req.body;

      const result = await query(
        `UPDATE certificates
         SET title = $1,
             thumbnail_url = $2,
             pdf_url = $3,
             issuer = $4,
             display_order = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          title,
          thumbnail_url,
          pdf_url,
          issuer || null,
          display_order || 0,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
      }

      return res.status(200).json({
        success: true,
        certificate: result.rows[0]
      });
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID required' });
      }

      const result = await query(
        'DELETE FROM certificates WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Certificate deleted'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Certificate API error:', err);

    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
