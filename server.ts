import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay lazy initialization
  let razorpayInstance: Razorpay | null = null;
  const getRazorpay = () => {
    if (!razorpayInstance) {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!key_id || !key_secret) {
        throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
      }
      
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
    }
    return razorpayInstance;
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Create Razorpay Order
  app.post('/api/payments/order', async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt } = req.body;
      
      const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency,
        receipt,
      };

      const razorpay = getRazorpay();
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error('Razorpay Order Error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Verify Razorpay Payment
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_secret) {
        return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET is missing' });
      }

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", key_secret)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ status: 'success', message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Payment Verification Error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
