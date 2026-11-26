import prisma from '@/lib/prisma';
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: '*',
  allowedHeaders: ['Content-Type'],
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await prisma.$queryRawUnsafe('EXEC sp_GetIssueDropdowns');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    return res.status(500).json({ error: 'Failed to fetch dropdown data', details: error.message });
  }
}
