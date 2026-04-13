import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import Learning from './pages/Learning';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email} (${user.uid})` : 'No user');
      setIsAuthReady(true);
      
      if (user) {
        // Sync user profile to Firestore in background
        const syncProfile = async () => {
          const userRef = doc(db, 'users', user.uid);
          try {
            const isDeveloper = user.email === 'al9434365@gmail.com';
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: isDeveloper ? 'admin' : 'user',
              lastLogin: serverTimestamp(),
            }, { merge: true });
            console.log('User profile synced successfully');
          } catch (err) {
            console.error('Error syncing user profile:', err);
            // Don't block the app for sync errors, but log them
          }
        };
        syncProfile();
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading || !isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500/30">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/learning/:id" 
              element={user ? <Learning /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin" 
              element={user ? <Admin /> : <Navigate to="/admin-login" />} 
            />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </Router>
  );
}
