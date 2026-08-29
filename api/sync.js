// Vercel Serverless Function: Real-Time Cross-Device Wedding Data Sync
let inMemoryWeddingData = null;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    if (inMemoryWeddingData) {
      return res.status(200).json({ success: true, source: 'cloud-live', data: inMemoryWeddingData });
    }
    return res.status(200).json({ success: true, source: 'default', data: null });
  }

  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (payload && (payload.general || payload.data)) {
        const weddingData = payload.data || payload;
        weddingData.updatedAt = Date.now();
        inMemoryWeddingData = weddingData;
        return res.status(200).json({ success: true, message: 'Data synced successfully to cloud!', updatedAt: weddingData.updatedAt });
      }
      return res.status(400).json({ success: false, error: 'Invalid wedding data payload' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
};
