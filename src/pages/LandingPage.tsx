import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/Button';
import { AnimatedText } from '../components/ui/AnimatedText';

export const LandingPage: React.FC = () => {
  const setStep = useAppStore((state) => state.setStep);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto min-h-[90vh]">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl animate-pulse-glow" />

      {/* Floating 3D Book Icon */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center shadow-lg shadow-brand-purple/35 animate-float">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </motion.div>

      {/* Hero Content */}
      <AnimatedText
        text="Discover your next favorite book."
        className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white mb-6 leading-tight"
      />

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 font-light leading-relaxed"
      >
        Bookie is a private, local AI companion that understands your ambitions, habits, and mindset, selecting the exact book you need to read next.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8, type: 'spring' }}
      >
        <Button
          variant="primary"
          onClick={() => setStep('name')}
          className="text-lg px-8 py-4 shadow-xl"
        >
          Let's find your book
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </motion.div>

      {/* Privacy note */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="text-xs text-gray-400 mt-6 tracking-wide uppercase"
      >
        100% On-Device AI • No Data Leaves Your Device
      </motion.span>
    </div>
  );
};

export default LandingPage;
