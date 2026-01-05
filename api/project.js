import jwt from 'jsonwebtoken';
import { query } from './lib/db.js';

function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = auth.split(' ')[1];
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

      const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json({ success: true, project: result.rows[0] });
    }

    verifyAuth(req);

    if (req.method === 'POST') {
      const { title, description, image_url, github_link, demo_link, tags, is_featured } = req.body;

      if (!title || !description || !image_url) {
        return res.status(400).json({ error: 'Title, description, and image_url required' });
      }
      const tagsSafe = Array.isArray(tags) ? tags : [];

      const result = await query(
        `INSERT INTO projects (title, description, image_url, github_link, demo_link, tags, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, description, image_url, github_link || null, demo_link || null, tagsSafe, !!is_featured]

      );

      return res.status(201).json({ success: true, project: result.rows[0] });
    }

    if (req.method === 'PUT') {
  if (!id) {
    return res.status(400).json({ error: 'ID required' });
  }

  const { title, description, image_url, github_link, demo_link, tags, is_featured, display_order } = req.body;

  const result = await query(
    `UPDATE projects 
     SET title = $1, description = $2, image_url = $3, github_link = $4, 
         demo_link = $5, tags = $6, is_featured = $7, display_order = $8, updated_at = NOW()
     WHERE id = $9 RETURNING *`,
    [title, description, image_url, github_link, demo_link, tags, is_featured, display_order || 0, id]
  );

  return res.status(200).json({ success: true, project: result.rows[0] });
}

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID required' });
      }

      const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json({ success: true, message: 'Project deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Project API error:', error);
    
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}