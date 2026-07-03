import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { useAppStore } from './store/appStore';
import { ParticleBackground } from './components/ui/ParticleBackground';

// Pages
import LandingPage from './pages/LandingPage';
import NameInputPage from './pages/NameInputPage';
import PhotoCapturePage from './pages/PhotoCapturePage';
import ConversationPage from './pages/ConversationPage';
import ThinkingPage from './pages/ThinkingPage';
import BookRevealPage from './pages/BookRevealPage';

export const App: React.FC = () => {
  const currentStep = useAppStore((state) => state.currentStep);

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const stepTransition = {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col justify-between">
      {/* High-fidelity Canvas Particle Background */}
      <ParticleBackground />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
            className="w-full flex-1 flex flex-col items-center justify-center"
          >
            {currentStep === 'landing' && <LandingPage />}
            {currentStep === 'name' && <NameInputPage />}
            {currentStep === 'photo' && <PhotoCapturePage />}
            {currentStep === 'conversation' && <ConversationPage />}
            {currentStep === 'thinking' && <ThinkingPage />}
            {currentStep === 'reveal' && <BookRevealPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mini Branding Footer */}
      <footer className="w-full text-center py-6 text-[10px] text-gray-500 tracking-wider uppercase z-10 pointer-events-none">
        Bookie © {new Date().getFullYear()} • Privacy-First AI Recommendations
      </footer>

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
};

export default App;
// auto-push watcher live test 1783095977
