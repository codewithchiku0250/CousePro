import { useParams, useNavigate } from 'react-router-dom';
import { SEED_COURSES } from '../constants';
import { Clock, User, Star, CheckCircle2, PlayCircle, ShieldCheck, CreditCard, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const course = SEED_COURSES.find(c => c.id === id);

  useEffect(() => {
    if (user && course) {
      const checkPurchase = async () => {
        const progressDoc = await getDoc(doc(db, 'progress', `${user.uid}_${course.id}`));
        if (progressDoc.exists()) {
          setHasPurchased(true);
        }
      };
      checkPurchase();
    }
  }, [user, course]);

  if (!course) return <div className="flex h-screen items-center justify-center text-white">Course not found</div>;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    setLoading(true);
    const res = await loadRazorpay();

    if (!res) {
      console.error('Razorpay SDK failed to load');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: course.price,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Course Pro',
        description: `Purchase ${course.title}`,
        image: 'https://picsum.photos/seed/logo/200/200',
        order_id: orderData.id,
        handler: async (response: any) => {
          // 3. Verify Payment on Backend
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            // 4. Save Order and Progress in Firestore
            try {
              await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                courseId: course.id,
                amount: course.price,
                status: 'paid',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                createdAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, 'orders');
            }

            try {
              await setDoc(doc(db, 'progress', `${user.uid}_${course.id}`), {
                userId: user.uid,
                courseId: course.id,
                completedLessons: [],
                lastWatchedLesson: '',
                progressPercentage: 0,
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `progress/${user.uid}_${course.id}`);
            }

            setHasPurchased(true);
            navigate(`/learning/${course.id}`);
          } else {
            console.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.displayName,
          email: user.email,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover blur-sm opacity-50" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="mx-auto max-w-7xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-4">
                <ShieldCheck className="h-5 w-5" />
                <span>Certified AI Course</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white sm:text-6xl">{course.title}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span>4.9 (2.5k reviews)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">About this course</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                {course.description}
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Lifetime access to all materials',
                  'Certificate of completion',
                  'Hands-on coding projects',
                  'Direct instructor support',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-8">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((module, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-zinc-900/30 overflow-hidden">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-bold text-white">{module.title}</h3>
                      <span className="text-xs text-gray-500 uppercase font-bold">{module.lessons.length} Lessons</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {module.lessons.map((lesson, j) => (
                        <div key={j} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-4">
                            <PlayCircle className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-300">{lesson.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl shadow-blue-600/10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-gray-400 font-medium">Course Price</span>
                <span className="text-3xl font-bold text-white">₹{course.price}</span>
              </div>

              {hasPurchased ? (
                <button
                  onClick={() => navigate(`/learning/${course.id}`)}
                  className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition-all hover:bg-green-700"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Enroll Now
                    </>
                  )}
                </button>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                30-Day Money-Back Guarantee
              </p>

              <div className="mt-8 space-y-4 border-t border-white/5 pt-8">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <PlayCircle className="h-4 w-4" />
                  <span>Full access to all videos</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure payment via Razorpay</span>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="mt-8 border-t border-white/5 pt-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                  <Share2 className="h-4 w-4 text-blue-400" />
                  <span>Share this course</span>
                </div>
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this amazing AI course: ${course.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-[#1DA1F2] hover:text-white transition-all"
                    title="Share on Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all"
                    title="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
