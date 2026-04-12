import { Course } from './types';

export const SEED_COURSES: Course[] = [
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'Master the core concepts of Artificial Intelligence, from history to modern applications.',
    instructor: 'Dr. Sarah Chen',
    price: 499,
    duration: '10 Hours',
    thumbnail: 'https://picsum.photos/seed/ai-fund/800/450',
    modules: [
      {
        id: 'm1',
        title: 'Introduction to AI',
        lessons: [
          { id: 'l1', title: 'What is AI?', videoUrl: 'https://www.youtube.com/embed/2ePf9rue1Ao', duration: '15m' },
          { id: 'l2', title: 'History of AI', videoUrl: 'https://www.youtube.com/embed/53uC_Z9_f04', duration: '20m' }
        ]
      }
    ]
  },
  {
    id: 'ml-basics',
    title: 'Machine Learning Basics',
    description: 'Learn how machines learn from data. Covers regression, classification, and clustering.',
    instructor: 'James Wilson',
    price: 999,
    duration: '15 Hours',
    thumbnail: 'https://picsum.photos/seed/ml-basics/800/450',
    modules: [
      {
        id: 'm1',
        title: 'Supervised Learning',
        lessons: [
          { id: 'l1', title: 'Linear Regression', videoUrl: 'https://www.youtube.com/embed/vOppx3KoY6Y', duration: '25m' }
        ]
      }
    ]
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Mastery',
    description: 'Dive deep into Neural Networks, CNNs, and RNNs with hands-on projects.',
    instructor: 'Elena Rodriguez',
    price: 1499,
    duration: '25 Hours',
    thumbnail: 'https://picsum.photos/seed/deep-learning/800/450',
    modules: [
      {
        id: 'm1',
        title: 'Neural Networks',
        lessons: [
          { id: 'l1', title: 'Backpropagation', videoUrl: 'https://www.youtube.com/embed/Ilg3gGewQ5U', duration: '30m' }
        ]
      }
    ]
  },
  {
    id: 'generative-ai',
    title: 'Generative AI (ChatGPT & Midjourney)',
    description: 'Learn to leverage LLMs and Image Generation models for productivity and creativity.',
    instructor: 'Alex Rivera',
    price: 799,
    duration: '12 Hours',
    thumbnail: 'https://picsum.photos/seed/gen-ai/800/450',
    modules: [
      {
        id: 'm1',
        title: 'Prompt Engineering',
        lessons: [
          { id: 'l1', title: 'Mastering ChatGPT', videoUrl: 'https://www.youtube.com/embed/jC4v5AS4RIM', duration: '20m' }
        ]
      }
    ]
  },
  {
    id: 'ai-app-dev',
    title: 'AI App Development',
    description: 'Build real-world AI applications using Python, OpenAI API, and React.',
    instructor: 'David Kim',
    price: 1999,
    duration: '30 Hours',
    thumbnail: 'https://picsum.photos/seed/ai-app/800/450',
    modules: [
      {
        id: 'm1',
        title: 'Building with OpenAI API',
        lessons: [
          { id: 'l1', title: 'API Integration', videoUrl: 'https://www.youtube.com/embed/9p3wM9p7Y9c', duration: '40m' }
        ]
      }
    ]
  }
];
