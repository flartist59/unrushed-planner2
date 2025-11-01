import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment validation failed');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        throw new Error('Payment setup failed');
      }

      const { clientSecret } = await response.json();

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed');
        setProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">
        Complete Your Purchase
      </h2>
      <p className="text-stone-600 mb-6 text-sm">
        Get your personalized European itinerary with detailed daily activities, 
        hidden gems, accessibility notes, and a beautifully formatted downloadable PDF.
      </p>
      
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors font-medium"
            disabled={processing}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!stripe || processing}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-stone-500 text-center space-y-1">
        <p>🔒 Secure payment powered by Stripe</p>
        <p className="text-stone-400">Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
}

interface StripeCheckoutProps {
  amount?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ 
  amount = 1999, 
  onSuccess, 
  onCancel 
}: StripeCheckoutProps) {
  const options = {
    mode: 'payment' as const,
    amount: amount,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#059669',
      }
    }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}