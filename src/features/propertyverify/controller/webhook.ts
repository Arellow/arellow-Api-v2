import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Use raw body to compute signature
router.post('/webhooks/paystack', express.raw({ type: '*/*' }), (req, res) => {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;
  const sig = req.headers['x-paystack-signature'] as string;

  // Compute HMAC SHA512 of payload
  const hmac = crypto.createHmac('sha512', PAYSTACK_SECRET)
    .update(req.body)
    .digest('hex');

  if (hmac !== sig) {
    console.warn("⚠️ Webhook signature mismatch");
    return res.status(400).send('Bad signature');
  }

  const event = JSON.parse(req.body.toString());
  const { event: eventType, data } = event;

  // Always respond quickly to Paystack
  res.status(200).send('OK');

  if (eventType === 'charge.success') {
    const reference = data.reference;
    const amount = data.amount;
    // Optional: validate amount, currency, user, etc.
    // Then mark your order or transaction as successful
    // e.g. update DB: paymentStatus = 'success', grant access, etc.
  }

  // You can handle other event types if needed
});

export default router;
