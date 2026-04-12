import { Link } from 'react-router-dom';
import { auth, signInWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, LogOut, User, BookOpen, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      };
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            AI
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CoursePro</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link to="/courses" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Courses</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">My Learning</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="h-8 w-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                <span className="hidden text-sm font-medium text-white md:block">{user.displayName}</span>
              </div>
              <button
                onClick={() => auth.signOut()}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              <LogIn className="h-4 w-4" />
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
