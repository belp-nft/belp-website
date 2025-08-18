import type { NextApiRequest, NextApiResponse } from 'next';
import { NftService } from '@/services/nftService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    const response = await NftService.getUserNfts(walletAddress);
    res.status(200).json(response);
  } catch (error) {
    console.error('API Error getting user NFTs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user NFTs',
      nfts: [] 
    });
  }
}
