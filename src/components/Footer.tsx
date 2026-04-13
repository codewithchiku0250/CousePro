import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                AI
              </div>
              <span className="text-xl font-bold tracking-tight text-white">CoursePro</span>
            </Link>
            <p className="max-w-md text-gray-400 leading-relaxed">
              Empowering the next generation of AI engineers. Learn from industry experts and build real-world AI applications with our premium courses.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/courses" className="text-gray-400 hover:text-white transition-colors">All Courses</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">My Learning</Link></li>
              <li><Link to="/admin-login" className="text-gray-400 hover:text-white transition-colors">Admin Portal</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                support@aicoursepro.com
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AI CoursePro. All rights reserved. Built for the future of AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
