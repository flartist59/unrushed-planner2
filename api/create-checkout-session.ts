import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Make sure STRIPE_SECRET_KEY is set in Vercel environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfContent } = req.body;

    if (!pdfContent) {
