export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: string;
  thumbnail: string;
  modules: Module[];
}

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'created' | 'paid' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  lastWatchedLesson: string;
  progressPercentage: number;
  updatedAt: string;
}
