import { Link } from 'react-router-dom';
import { Course } from '../types';
import { Clock, User, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CourseCardProps {
  course: Course;
  key?: string | number;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-blue-500/50 hover:bg-white/10"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        {/* Play Icon Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-xl backdrop-blur-sm">
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
          <Star className="h-3 w-3 fill-current" />
          Best Seller
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {course.instructor}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-bold text-white line-clamp-1">{course.title}</h3>
        <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Price</span>
            <span className="text-xl font-bold text-white">₹{course.price}</span>
          </div>
          <Link
            to={`/course/${course.id}`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
