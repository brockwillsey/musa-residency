import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function createPaymentIntent(
  amount: number,
  bookingId: string,
  guestEmail: string
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      bookingId,
    },
    receipt_email: guestEmail,
    capture_method: 'manual', // Don't charge until host approves
  });

  return paymentIntent;
}

export async function capturePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.cancel(paymentIntentId);
}