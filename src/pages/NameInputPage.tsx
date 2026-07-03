import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export const NameInputPage: React.FC = () => {
  const { setUserName, setStep } = useAppStore();
  const [name, setName] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUserName(name.trim());
    setShowGreeting(true);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto min-h-[90vh] relative z-10">
      <AnimatePresence mode="wait">
        {!showGreeting ? (
          <motion.div
            key="input-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <GlassCard className="w-full">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white mb-2">
                What should I call you?
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Your name helps me personalize our reading consultation.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-lg text-center transition-all"
                  />
                </div>

                <Button variant="primary" type="submit" fullWidth>
                  Continue
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
              Hi, {name}.
              <br />
              <span className="text-brand-purple">I'm excited to meet you.</span>
            </h1>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <Button variant="secondary" onClick={() => setStep('photo')}>
                Let's begin
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NameInputPage;
