import { useParams, useNavigate } from 'react-router-dom';
import { SEED_COURSES } from '../constants';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Progress, Lesson } from '../types';
import { PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Learning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const course = SEED_COURSES.find(c => c.id === id);

  useEffect(() => {
    if (user && course) {
      const fetchProgress = async () => {
        try {
          const progressDoc = await getDoc(doc(db, 'progress', `${user.uid}_${course.id}`));
          if (progressDoc.exists()) {
            const data = progressDoc.data() as Progress;
            setProgress(data);
            
            // Set initial lesson
            const allLessons = course.modules.flatMap(m => m.lessons);
            const initialLesson = allLessons.find(l => l.id === data.lastWatchedLesson) || allLessons[0];
            setCurrentLesson(initialLesson);
          } else {
            navigate(`/course/${course.id}`);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `progress/${user.uid}_${course.id}`);
        } finally {
          setLoading(false);
        }
      };
      fetchProgress();
    }
  }, [user, course, id, navigate]);

  if (loading || !course || !currentLesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const handleLessonComplete = async (lessonId: string) => {
    if (!user || !progress) return;

    const isCompleted = progress.completedLessons.includes(lessonId);
    let newCompleted = [...progress.completedLessons];
    
    if (!isCompleted) {
      newCompleted.push(lessonId);
    }

    const allLessonsCount = course.modules.flatMap(m => m.lessons).length;
    const newPercentage = Math.round((newCompleted.length / allLessonsCount) * 100);

    const progressRef = doc(db, 'progress', `${user.uid}_${course.id}`);
    try {
      await updateDoc(progressRef, {
        completedLessons: newCompleted,
        progressPercentage: newPercentage,
        lastWatchedLesson: lessonId,
        updatedAt: serverTimestamp(),
      });

      setProgress({
        ...progress,
        completedLessons: newCompleted,
        progressPercentage: newPercentage,
        lastWatchedLesson: lessonId,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `progress/${user.uid}_${course.id}`);
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-16 left-0 z-40 w-80 transform border-r border-white/10 bg-zinc-950 transition-transform duration-300 lg:static lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:hidden"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <h2 className="font-bold text-white line-clamp-1">{course.title}</h2>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-400">Your Progress</span>
                <span className="text-blue-400 font-bold">{progress?.progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500" 
                  style={{ width: `${progress?.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {course.modules.map((module, i) => (
              <div key={i}>
                <h3 className="px-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{module.title}</h3>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isCompleted = progress?.completedLessons.includes(lesson.id);
                    const isActive = currentLesson.id === lesson.id;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all",
                          isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-white/5"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <PlayCircle className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-gray-600")} />
                        )}
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        <span className="text-[10px] opacity-50">{lesson.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle Sidebar Button (Mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-50 rounded-lg bg-zinc-900 p-2 lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {/* Video Player */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
                <p className="mt-2 text-gray-400">Module: {course.modules.find(m => m.lessons.some(l => l.id === currentLesson.id))?.title}</p>
              </div>
              
              <button
                onClick={() => handleLessonComplete(currentLesson.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold transition-all",
                  progress?.completedLessons.includes(currentLesson.id)
                    ? "bg-green-600/20 text-green-500 border border-green-500/30"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
                {progress?.completedLessons.includes(currentLesson.id) ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>

            <div className="mt-12 border-t border-white/10 pt-12">
              <h2 className="text-xl font-bold text-white mb-6">About this lesson</h2>
              <p className="text-gray-400 leading-relaxed">
                In this lesson, we dive deep into {currentLesson.title}. We'll cover the fundamental concepts, practical implementations, and best practices to ensure you have a solid understanding of the topic.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
