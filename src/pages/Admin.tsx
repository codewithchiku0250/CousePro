import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Course, Order, UserProfile } from '../types';
import { SEED_COURSES } from '../constants';
import { 
  Plus, Trash2, Users, CreditCard, BookOpen, Database, 
  ShieldAlert, LayoutDashboard, Settings, Edit3, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Search
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import CourseModal from '../components/CourseModal';
import { cn } from '../lib/utils';

type Tab = 'overview' | 'courses' | 'users' | 'orders' | 'settings';

export default function Admin() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        // 1. Priority check for hardcoded admin email
        if (user.email === 'al9434365@gmail.com') {
          setIsAdmin(true);
          fetchData();
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
            fetchData();
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          // If Firestore check fails but they aren't the hardcoded admin, redirect
          navigate('/');
        }
      };
      checkAdmin();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseSnap, orderSnap, userSnap] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users'))
      ]);

      setCourses(courseSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setUsers(userSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    try {
      for (const course of SEED_COURSES) {
        await setDoc(doc(db, 'courses', course.id), course);
      }
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'courses');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${id}`);
    }
  };

  const saveCourse = async (course: Course) => {
    try {
      await setDoc(doc(db, 'courses', course.id), course);
      setIsModalOpen(false);
      setEditingCourse(null);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `courses/${course.id}`);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Analytics Data
  const revenueData = orders.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt as any).toLocaleDateString();
    const existing = acc.find(a => a.date === date);
    if (existing) {
      existing.revenue += order.amount;
    } else {
      acc.push({ date, revenue: order.amount });
    }
    return acc;
  }, []).reverse();

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-zinc-950 pt-20">
          <div className="px-4 py-6">
            <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Admin Menu</h2>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'courses', label: 'Courses', icon: BookOpen },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'orders', label: 'Orders', icon: CreditCard },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="absolute bottom-8 left-0 w-full px-4">
            <button
              onClick={seedDatabase}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Database className="h-4 w-4" />
              Seed Sample Data
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 pt-24">
          <header className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="mt-1 text-gray-400">Manage your AI learning platform.</p>
            </div>
            {activeTab === 'courses' && (
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Course
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + o.amount, 0)}`, icon: TrendingUp, color: 'text-green-400', trend: '+12%' },
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400', trend: '+5%' },
                    { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-purple-400', trend: '0%' },
                    { label: 'Total Sales', value: orders.length, icon: CreditCard, color: 'text-yellow-400', trend: '+8%' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`rounded-xl bg-white/5 p-2 ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                          <ArrowUpRight className="h-3 w-3" />
                          {stat.trend}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
                    <h3 className="text-lg font-bold text-white mb-8">Revenue Overview</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
                    <h3 className="text-lg font-bold text-white mb-8">Sales by Course</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courses.map(c => ({ 
                          name: c.title.substring(0, 10) + '...', 
                          sales: orders.filter(o => o.courseId === c.id).length 
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {courses
                    .filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                    .map((course) => (
                    <div key={course.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-4 transition-all hover:border-blue-500/50">
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                        <img src={course.thumbnail} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                        <div className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                          ₹{course.price}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-gray-400">{course.instructor}</p>
                        <div className="mt-6 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm font-bold text-white hover:bg-white/10"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCourse(course.id)}
                            className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        <th className="px-8 py-4">User</th>
                        <th className="px-8 py-4">Email</th>
                        <th className="px-8 py-4">Role</th>
                        <th className="px-8 py-4">Joined</th>
                        <th className="px-8 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users
                        .filter(u => 
                          u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .map((u) => (
                        <tr key={u.uid} className="text-sm">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <img src={u.photoURL} alt="" className="h-8 w-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                              <span className="font-bold text-white">{u.displayName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-gray-400">{u.email}</td>
                          <td className="px-8 py-4">
                            <span className={cn(
                              "rounded-full px-3 py-1 text-[10px] font-bold uppercase",
                              u.role === 'admin' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-gray-400">
                            {new Date(u.createdAt as any).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4">
                            <button
                              onClick={() => toggleUserRole(u.uid, u.role)}
                              className="text-xs font-bold text-blue-400 hover:underline"
                            >
                              Toggle Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        <th className="px-8 py-4">Order ID</th>
                        <th className="px-8 py-4">User</th>
                        <th className="px-8 py-4">Course</th>
                        <th className="px-8 py-4">Amount</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders
                        .filter(o => {
                          const userName = users.find(u => u.uid === o.userId)?.displayName || '';
                          const courseName = courses.find(c => c.id === o.courseId)?.title || '';
                          return o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                 userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                 courseName.toLowerCase().includes(orderSearch.toLowerCase());
                        })
                        .map((o) => (
                        <tr key={o.id} className="text-sm">
                          <td className="px-8 py-4 font-mono text-xs text-gray-500">{o.id.substring(0, 8)}...</td>
                          <td className="px-8 py-4 text-white">{users.find(u => u.uid === o.userId)?.displayName || 'Unknown'}</td>
                          <td className="px-8 py-4 text-gray-400">{courses.find(c => c.id === o.courseId)?.title || 'Unknown'}</td>
                          <td className="px-8 py-4 font-bold text-white">₹{o.amount}</td>
                          <td className="px-8 py-4">
                            <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase text-green-500">
                              {o.status}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-gray-400">
                            {new Date(o.createdAt as any).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl space-y-8"
              >
                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
                  <h3 className="text-lg font-bold text-white mb-6">Platform Configuration</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Platform Name</label>
                      <input type="text" defaultValue="AI Course Pro" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
                      <input type="email" defaultValue="support@aicoursepro.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Currency Symbol</label>
                      <input type="text" defaultValue="₹" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <button className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-all">
                      Save Settings
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
                  <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-400 mb-6">Irreversible actions for your platform.</p>
                  <button className="rounded-xl border border-red-500/30 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    Reset Platform Data
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CourseModal
            course={editingCourse}
            onClose={() => {
              setIsModalOpen(false);
              setEditingCourse(null);
            }}
            onSave={saveCourse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
