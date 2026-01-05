import { query } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit } = req.query;

    let sql = 'SELECT * FROM certificates ORDER BY display_order ASC, created_at DESC';
    const params = [];

    if (limit) {
      params.push(parseInt(limit));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      certificates: result.rows
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    return res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}