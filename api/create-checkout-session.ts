
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itineraryHtml } = req.body;

    // Create a PDF buffer from the itinerary HTML
    const pdfBuffer = await generatePdf(itineraryHtml);

    // Upload PDF to Stripe file (optional) or provide a secure download link later
    // For simplicity, we’ll generate a checkout session for $25
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Unrushed Europe Full Itinerary PDF',
            },
            unit_amount: 2500, // $25 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/pdf-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pdf-cancel`,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Simple PDF generator using Puppeteer
 */
async function generatePdf(html: string): Promise<Buffer> {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}
