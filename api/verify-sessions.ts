import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ success: false });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    if (session.payment_status === 'paid') {
      res.json({ success: true, pdfContent: session.metadata.pdfContent });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

