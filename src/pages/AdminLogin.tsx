import { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, ArrowRight, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus(user.uid, user.email || '');
    }
  }, [user]);

  const checkAdminStatus = async (uid: string, email: string) => {
    setCheckingAdmin(true);
    setError(null);
    
    // 1. Immediate check for hardcoded admin email
    const isHardcodedAdmin = email === 'al9434365@gmail.com';
    
    if (isHardcodedAdmin) {
      console.log('Hardcoded admin detected, granting access...');
      navigate('/admin');
      setCheckingAdmin(false);
      return;
    }

    try {
      // 2. Check Firestore for admin role
      const userDoc = await getDoc(doc(db, 'users', uid));
      const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        setError('Access Denied: You do not have administrator privileges.');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Admin check error:', err);
      // If it's a permission error but they just logged in, it might be a race condition
      // But since we already checked the hardcoded email above, this catch block 
      // is mainly for other users or unexpected errors.
      setError('Access Denied or Verification Error. Please ensure you are using the admin account.');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-gray-400">Secure access for platform administrators</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading || checkingAdmin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-lg font-bold text-black transition-all hover:bg-gray-100 disabled:opacity-50"
          >
            {loading || checkingAdmin ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="" className="h-5 w-5" />
                Sign in as Admin
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-gray-500 font-bold tracking-widest">Protected Area</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-500 leading-relaxed">
                This area is restricted to authorized personnel only. All access attempts are logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
