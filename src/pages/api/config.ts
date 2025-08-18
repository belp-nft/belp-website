import type { NextApiRequest, NextApiResponse } from 'next';
import { ConfigService } from '@/services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await ConfigService.getCandyMachineConfig();
    res.status(200).json(response);
  } catch (error) {
    console.error('API Error getting config:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch config' 
    });
  }
}
