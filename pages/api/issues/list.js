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
    const { viewType = 'ALL', employeeId = '', fromDate = '', toDate = '' } = req.query;

    const safeViewType = viewType === 'HISTORY' ? 'HISTORY' : 'ALL';
    const safeEmployeeId = String(employeeId).replace(/'/g, "''");
    const safeFromDate = String(fromDate).replace(/'/g, "''");
    const safeToDate = String(toDate).replace(/'/g, "''");

    const sql = `EXEC sp_GetMajorIssues @ViewType = N'${safeViewType}', @EmployeeId = N'${safeEmployeeId}', @FromDate = ${
      safeFromDate ? `N'${safeFromDate}'` : 'NULL'
    }, @ToDate = ${safeToDate ? `N'${safeToDate}'` : 'NULL'}`;

    const result = await prisma.$queryRawUnsafe(sql);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching issues list:', error);
    return res.status(500).json({ error: 'Failed to fetch issues', details: error.message });
  }
}
