import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { Progress, Course, Order } from '../types';
import { SEED_COURSES } from '../constants';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Trophy, Clock, ArrowRight, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type Tab = 'courses' | 'orders';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [userProgress, setUserProgress] = useState<(Progress & { course: Course })[]>([]);
  const [userOrders, setUserOrders] = useState<(Order & { course: Course | undefined })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('courses');

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch Progress
          const progressQ = query(collection(db, 'progress'), where('userId', '==', user.uid));
          const progressSnap = await getDocs(progressQ);
          const progressData: (Progress & { course: Course })[] = [];

          progressSnap.forEach((doc) => {
            const data = doc.data() as Progress;
            const course = SEED_COURSES.find(c => c.id === data.courseId);
            if (course) {
              progressData.push({ ...data, course });
            }
          });
          setUserProgress(progressData);

          // Fetch Orders
          const ordersQ = query(
            collection(db, 'orders'), 
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const ordersSnap = await getDocs(ordersQ);
          const ordersData: (Order & { course: Course | undefined })[] = [];

          ordersSnap.forEach((doc) => {
            const data = doc.data() as Order;
            const course = SEED_COURSES.find(c => c.id === data.courseId);
            ordersData.push({ ...data, id: doc.id, course });
          });
          setUserOrders(ordersData);

        } catch (err) {
          console.error('Error fetching dashboard data:', err);
          // Fallback if index is not ready yet
          if (err instanceof Error && err.message.includes('index')) {
            console.warn('Firestore index is building...');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Welcome back, {user?.displayName}!</h1>
          <p className="mt-2 text-gray-400">Continue your journey to becoming an AI expert.</p>
        </header>

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: 'Courses Enrolled', value: userProgress.length, icon: BookOpen, color: 'text-blue-400' },
            { label: 'Lessons Completed', value: userProgress.reduce((acc, p) => acc + p.completedLessons.length, 0), icon: Trophy, color: 'text-yellow-400' },
            { label: 'Learning Hours', value: '12.5h', icon: Clock, color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={stat.color}>
                  <stat.icon className="h-8 w-8 opacity-50" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8 flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('courses')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === 'courses' ? "border-blue-600 text-white" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === 'orders' ? "border-blue-600 text-white" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            Purchase History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'courses' ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {userProgress.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {userProgress.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:border-blue-500/50"
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        <img src={item.course.thumbnail} alt={item.course.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white">{item.course.title}</h3>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-1">Instructor: {item.course.instructor}</p>
                        
                        <div className="mt-6">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-blue-400 font-bold">{item.progressPercentage}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-500" 
                              style={{ width: `${item.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          to={`/learning/${item.course.id}`}
                          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-600"
                        >
                          <PlayCircle className="h-4 w-4" />
                          Continue Learning
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/30 py-20 text-center">
                  <BookOpen className="h-16 w-16 text-gray-600 mb-6" />
                  <h3 className="text-xl font-bold text-white">No courses yet</h3>
                  <p className="mt-2 text-gray-400 max-w-xs">Start your AI journey today by enrolling in one of our premium courses.</p>
                  <Link to="/courses" className="mt-8 rounded-full bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700">
                    Browse Courses
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden"
            >
              {userOrders.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Course</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userOrders.map((order) => (
                      <tr key={order.id} className="text-sm">
                        <td className="px-8 py-4 font-mono text-xs text-gray-500">{order.id.substring(0, 8)}...</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 overflow-hidden rounded border border-white/10">
                              <img src={order.course?.thumbnail} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <span className="font-bold text-white">{order.course?.title || 'Unknown Course'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 font-bold text-white">₹{order.amount}</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase">{order.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-gray-400">
                          {new Date(order.createdAt as any).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <p className="text-gray-400">No purchase history found.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
