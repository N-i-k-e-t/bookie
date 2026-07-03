import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { LoadingOrb } from '../components/ui/LoadingOrb';
import { getThinkingMessages } from '../lib/conversationEngine';
import { buildPersonalityProfile, profileToEmbeddingText } from '../lib/personalityMapper';
import { generateRecommendation } from '../lib/recommendationEngine';
import { getEmbedding } from '../workers/workerManager';

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

  // Handle recommendation generation pipeline
  useEffect(() => {
    const runPipeline = async () => {
      // Progress simulation (takes around 6 seconds total for anticipation)
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1.5;
        });
      }, 80);

      try {
        console.log('Calculating personality profile...');
        // 1. Build personality profile from conversation responses + face analysis
        const profile = buildPersonalityProfile(messages, faceAnalysis);
        setPersonalityProfile(profile);

        // 2. Generate embedding text summary
        const embedText = profileToEmbeddingText(profile, messages);
        console.log('Generated embedding text:', embedText);

        // 3. Compute vector embedding from text summary
        let userEmbedding: number[] | undefined;
        try {
          userEmbedding = await getEmbedding(embedText);
          console.log('Computed user embedding vector successfully.');
        } catch (error) {
          console.warn('Embedding computation failed, falling back to heuristic matching:', error);
        }

        // 4. Generate recommendation (deterministic traits + vector cosine similarity search)
        const rec = generateRecommendation(profile, userEmbedding);
        setRecommendation(rec);

        // Make sure progress reaches 100% and displays the next step smoothly
        setTimeout(() => {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setTimeout(() => {
            setStep('reveal');
          }, 500);
        }, 6000);

      } catch (error) {
        console.error('Error generating recommendation:', error);
        alert('An error occurred while analyzing your results. Restarting.');
        setStep('landing');
      }

      return () => clearInterval(progressInterval);
    };

    runPipeline();
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
