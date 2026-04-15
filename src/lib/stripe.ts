import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export { stripe };

export async function createPaymentIntent(amount: number, metadata: Record<string, string>) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata,
    capture_method: 'manual', // Authorize now, capture later on approval
  });
}

export async function capturePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.cancel(paymentIntentId);
}