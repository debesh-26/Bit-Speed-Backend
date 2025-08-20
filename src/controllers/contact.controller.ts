import { Request, Response } from 'express';
import { reconcileContact } from '../services/contact.service';

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided.' });
  }

  try {
    const result = await reconcileContact({ email, phoneNumber });
    return res.status(200).json({ contact: result });
  } catch (error) {
    console.error('Error in identifyContact controller:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};