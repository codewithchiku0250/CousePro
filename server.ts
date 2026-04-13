import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json';
import { sendEnrollmentEmail, sendCompletionEmail } from './src/services/emailService.js';

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const adminDb = admin.firestore();
if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
  // If a specific database ID is provided, we should use it. 
  // Note: admin.firestore(databaseId) is the way to access named databases.
  // However, in many cases '(default)' is used.
}

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
    
    // Set up Firestore Listeners for Notifications
    setupFirestoreListeners();
  });

  function setupFirestoreListeners() {
    console.log('Setting up Firestore listeners for notifications (using Admin SDK)...');

    // 1. Listen for new paid orders (Enrollments)
    adminDb.collection('orders')
      .where('status', '==', 'paid')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const orderData = change.doc.data();
            console.log('New paid order detected:', change.doc.id);
            
            try {
              // Fetch user details
              const userDoc = await adminDb.collection('users').doc(orderData.userId).get();
              // Fetch course details
              const courseDoc = await adminDb.collection('courses').doc(orderData.courseId).get();

              if (userDoc.exists && courseDoc.exists) {
                const userData = userDoc.data();
                const courseData = courseDoc.data();
                
                if (userData && courseData) {
                  await sendEnrollmentEmail(userData.email, userData.displayName || 'Learner', courseData.title);
                  console.log(`Enrollment email sent to ${userData.email} for ${courseData.title}`);
                }
              }
            } catch (error) {
              console.error('Error processing enrollment notification:', error);
            }
          }
        });
      }, (error) => {
        console.error('Error in orders snapshot listener:', error);
      });

    // 2. Listen for course completion (Progress == 100)
    adminDb.collection('progress')
      .where('progressPercentage', '==', 100)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const progressData = change.doc.data();
            console.log('Course completion detected for user:', progressData.userId);

            try {
              // Fetch user details
              const userDoc = await adminDb.collection('users').doc(progressData.userId).get();
              // Fetch course details
              const courseDoc = await adminDb.collection('courses').doc(progressData.courseId).get();

              if (userDoc.exists && courseDoc.exists) {
                const userData = userDoc.data();
                const courseData = courseDoc.data();
                
                if (userData && courseData) {
                  await sendCompletionEmail(userData.email, userData.displayName || 'Learner', courseData.title);
                  console.log(`Completion email sent to ${userData.email} for ${courseData.title}`);
                }
              }
            } catch (error) {
              console.error('Error processing completion notification:', error);
            }
          }
        });
      }, (error) => {
        console.error('Error in progress snapshot listener:', error);
      });
  }
}

startServer();
