import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/verify-payment/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    const { status, data } = resp.data;
    if (!status) {
      return res.status(400).json({ success: false, message: "Verify API failed" });
    }

    // data.status is the transaction status ("success", "failed", etc.)
    if (data.status === "success") {
      // Payment succeeded — do your post‑payment logic (credit user, mark order paid, etc.)
      // But make sure to guard against duplicate fulfillment
      return res.json({ success: true, data });
    } else {
      return res.json({ success: false, data });
    }
  } catch (error: any) {
    console.error("Paystack verify error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
});

export default router;
