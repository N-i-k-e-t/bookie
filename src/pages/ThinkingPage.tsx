import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { LoadingOrb } from '../components/ui/LoadingOrb';
import { getThinkingMessages } from '../lib/conversationEngine';
import { buildPersonalityProfile } from '../lib/personalityMapper';
import { generateRecommendation } from '../lib/recommendationEngine';

export const ThinkingPage: React.FC = () => {
  const {
    messages,
    faceAnalysis,
    setPersonalityProfile,
    setRecommendation,
    setStep,
  } = useAppStore();

  const [messageIdx, setMessageIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const messagesList = getThinkingMessages();

  // Cycle messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % messagesList.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messagesList.length]);

  // Deterministic, on-device recommendation — NO models, NO network calls.
  // A brief anticipation animation runs, then we always advance to the reveal.
  useEffect(() => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(100, progress + 2);
      setLoadingProgress(progress);
    }, 60);

    let revealTimer: ReturnType<typeof setTimeout>;
    try {
      // 1. Build personality profile from conversation answers + face cues.
      const profile = buildPersonalityProfile(messages, faceAnalysis);
      setPersonalityProfile(profile);

      // 2. Match deterministically against the catalog (personality tags +
      //    emotional tone + keyword overlap). Instant, no embeddings required.
      const rec = generateRecommendation(profile);
      setRecommendation(rec);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      // Always reveal after a short beat, whatever happened above.
      revealTimer = setTimeout(() => setStep('reveal'), 3200);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(revealTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[90vh] relative z-10">
      {/* Background Neural Network Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl animate-pulse-glow" />

      <AnimatePresence mode="wait">
        <motion.div
          key={messageIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="absolute top-[35%] md:top-[38%] text-center max-w-sm px-4"
        >
          {/* We show dynamic text insights in real-time */}
        </motion.div>
      </AnimatePresence>

      <div className="z-10 mt-12">
        <LoadingOrb
          message={messagesList[messageIdx]}
          progress={loadingProgress}
        />
      </div>
    </div>
  );
};

export default ThinkingPage;
