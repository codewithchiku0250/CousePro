import { useState, useEffect, useMemo } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { Course } from '../types';
import { SEED_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import CourseModal from '../components/CourseModal';

export default function Courses() {
  const [user] = useAuthState(auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('All');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        if (user.email === 'al9434365@gmail.com') {
          setIsAdmin(true);
          return;
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      };
      checkAdmin();
    }
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      if (querySnapshot.empty) {
        setCourses(SEED_COURSES);
      } else {
        setCourses(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(SEED_COURSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveCourse = async (courseData: Course) => {
    try {
      await setDoc(doc(db, 'courses', courseData.id), courseData);
      setIsModalOpen(false);
      setEditingCourse(null);
      await fetchCourses();
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error saving course:', error);
      handleFirestoreError(error, OperationType.WRITE, `courses/${courseData.id}`);
    }
  };

  const instructors = useMemo(() => {
    const unique = new Set(courses.map(c => c.instructor));
    return ['All', ...Array.from(unique)];
  }, [courses]);

  const maxCoursePrice = useMemo(() => {
    if (courses.length === 0) return 10000;
    return Math.max(...courses.map(c => c.price));
  }, [courses]);

  useEffect(() => {
    if (maxCoursePrice > 0) {
      setPriceRange(maxCoursePrice);
    }
  }, [maxCoursePrice]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesInstructor = selectedInstructor === 'All' || course.instructor === selectedInstructor;
    const matchesPrice = course.price <= priceRange;

    return matchesSearch && matchesInstructor && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">All AI Courses</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Browse our comprehensive catalog of AI courses and start your learning journey today.
          </p>
        </header>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by title, description, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-bold transition-all ${
              showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  {/* Instructor Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Instructor</label>
                    <select
                      value={selectedInstructor}
                      onChange={(e) => setSelectedInstructor(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                    >
                      {instructors.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Max Price</label>
                      <span className="text-sm font-bold text-blue-400">₹{priceRange}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxCoursePrice}
                      step="100"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>₹0</span>
                      <span>₹{maxCoursePrice}</span>
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedInstructor('All');
                        setPriceRange(maxCoursePrice);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4">
                <div className="aspect-video w-full animate-pulse rounded-xl bg-white/5" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-white/5" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-white/5 mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{filteredCourses.length}</span> courses
              </p>
            </div>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    isAdmin={isAdmin}
                    onEdit={(c) => {
                      setEditingCourse(c);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center rounded-2xl border border-dashed border-white/10">
                <p className="text-xl text-gray-500">No courses found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSelectedInstructor('All');
                    setPriceRange(maxCoursePrice);
                    setSearchQuery('');
                  }}
                  className="mt-4 text-blue-400 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CourseModal
            course={editingCourse}
            onClose={() => {
              setIsModalOpen(false);
              setEditingCourse(null);
            }}
            onSave={handleSaveCourse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
