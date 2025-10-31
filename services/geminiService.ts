// api/create-checkout-session.ts
import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next'; // or use standard types if not Next.js

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBlob } = req.body;

    if (!pdfBlob) {
      return res.status(400).json({ error: 'No PDF content received' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Unrushed Europe Full Itinerary PDF',
            },
            unit_amount: 2500, // $25
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      metadata: {
        pdfContent: pdfBlob,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
