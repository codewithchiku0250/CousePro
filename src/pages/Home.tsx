import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Brain, Code, Rocket, ShieldCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEED_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const [user] = useAuthState(auth);

  const openAuthModal = () => {
    window.dispatchEvent(new CustomEvent('open-auth-modal'));
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-20 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>The Future of Learning is Here</span>
          </div>
          
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Learn AI & Build Your <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Future 🚀</span>
          </h1>
          
          <p className="mt-6 text-lg text-gray-400 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Master Artificial Intelligence with industry-leading courses. From fundamentals to advanced app development, we've got you covered.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/courses"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] sm:w-auto"
            >
              Explore Courses
              <ArrowRight className="h-5 w-5" />
            </Link>
            {!user && (
              <button 
                onClick={openAuthModal}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10 sm:w-auto"
              >
                <UserPlus className="h-5 w-5" />
                Sign Up Now
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: 'Students', value: '10k+' },
            { label: 'Courses', value: '50+' },
            { label: 'Instructors', value: '20+' },
            { label: 'Success Rate', value: '98%' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-black px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Featured AI Courses</h2>
              <p className="mt-4 text-gray-400">Handpicked courses to kickstart your AI journey.</p>
            </div>
            <Link to="/courses" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
              View All Courses →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {SEED_COURSES.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Why Learn With Us?</h2>
            <p className="mt-4 text-gray-400">We provide the best tools and resources for your success.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Brain, title: 'Expert Instructors', desc: 'Learn from PhDs and industry leaders with years of experience.' },
              { icon: Code, title: 'Hands-on Projects', desc: 'Build real-world AI apps that you can showcase in your portfolio.' },
              { icon: Rocket, title: 'Career Support', desc: 'Get resume reviews and interview prep for top AI roles.' },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.05]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-4 text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-center shadow-2xl shadow-blue-600/20">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">Ready to Start Your AI Journey?</h2>
          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of students who are already building the future with AI. Get started today and save 20% on your first course.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/courses" className="rounded-full bg-white px-8 py-4 text-lg font-bold text-blue-600 transition-all hover:bg-blue-50">
              Browse Courses
            </Link>
            {!user && (
              <button 
                onClick={openAuthModal}
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Sign Up Now
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
