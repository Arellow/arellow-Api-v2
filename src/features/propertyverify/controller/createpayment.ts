// Express backend route (Node.js)
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/create-payment', async (req, res) => {
  const { email, amount, metadata } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // amount in kobo
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url } = response.data.data;
    return res.json({ paymentUrl: authorization_url });

  } catch (error) {
    // console.error('Paystack error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to initialize payment' });
  }
});
