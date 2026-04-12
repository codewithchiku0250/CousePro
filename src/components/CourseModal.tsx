import React, { useState } from 'react';
import { Course, Module } from '../types';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CourseModalProps {
  course?: Course | null;
  onClose: () => void;
  onSave: (course: Course) => void;
}

export default function CourseModal({ course, onClose, onSave }: CourseModalProps) {
  const [formData, setFormData] = useState<Partial<Course>>(
    course || {
      title: '',
      description: '',
      instructor: '',
      price: 0,
      duration: '',
      thumbnail: 'https://picsum.photos/seed/ai/800/450',
      modules: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: course?.id || `course_${Date.now()}`,
    } as Course);
  };

  const addModule = () => {
    const newModule: Module = {
      id: `m_${Date.now()}`,
      title: 'New Module',
      lessons: []
    };
    setFormData({ ...formData, modules: [...(formData.modules || []), newModule] });
  };

  const updateModule = (index: number, title: string) => {
    const newModules = [...(formData.modules || [])];
    newModules[index].title = title;
    setFormData({ ...formData, modules: newModules });
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...(formData.modules || [])];
    newModules[moduleIndex].lessons.push({
      id: `l_${Date.now()}`,
      title: 'New Lesson',
      videoUrl: '',
      duration: '10m'
    });
    setFormData({ ...formData, modules: newModules });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-full max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-8">{course ? 'Edit Course' : 'Add New Course'}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Course Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Instructor Name</label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Duration</label>
              <input
                type="text"
                required
                placeholder="e.g. 10 Hours"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Thumbnail URL</label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <input
                type="text"
                required
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
              {formData.thumbnail && (
                <div className="h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-white/10">
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/400/225';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Curriculum</h3>
              <button
                type="button"
                onClick={addModule}
                className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300"
              >
                <Plus className="h-4 w-4" />
                Add Module
              </button>
            </div>

            <div className="space-y-6">
              {formData.modules?.map((module, mIndex) => (
                <div key={module.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(mIndex, e.target.value)}
                      className="flex-1 bg-transparent text-lg font-bold text-white border-b border-white/10 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newModules = [...(formData.modules || [])];
                        newModules.splice(mIndex, 1);
                        setFormData({ ...formData, modules: newModules });
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 pl-6">
                    {module.lessons.map((lesson, lIndex) => (
                      <div key={lesson.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Lesson Title"
                          value={lesson.title}
                          onChange={(e) => {
                            const newModules = [...(formData.modules || [])];
                            newModules[mIndex].lessons[lIndex].title = e.target.value;
                            setFormData({ ...formData, modules: newModules });
                          }}
                          className="bg-white/5 rounded-lg px-3 py-1.5 text-sm text-white border border-white/10"
                        />
                        <input
                          type="text"
                          placeholder="Video URL"
                          value={lesson.videoUrl}
                          onChange={(e) => {
                            const newModules = [...(formData.modules || [])];
                            newModules[mIndex].lessons[lIndex].videoUrl = e.target.value;
                            setFormData({ ...formData, modules: newModules });
                          }}
                          className="bg-white/5 rounded-lg px-3 py-1.5 text-sm text-white border border-white/10"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Duration"
                            value={lesson.duration}
                            onChange={(e) => {
                              const newModules = [...(formData.modules || [])];
                              newModules[mIndex].lessons[lIndex].duration = e.target.value;
                              setFormData({ ...formData, modules: newModules });
                            }}
                            className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-sm text-white border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newModules = [...(formData.modules || [])];
                              newModules[mIndex].lessons.splice(lIndex, 1);
                              setFormData({ ...formData, modules: newModules });
                            }}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(mIndex)}
                      className="text-xs font-bold text-gray-500 hover:text-blue-400"
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-8 py-3 font-bold text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700"
            >
              <Save className="h-5 w-5" />
              Save Course
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
