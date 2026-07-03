import React from 'react';
import { motion } from 'motion/react';

interface LoadingOrbProps {
  message?: string;
  progress?: number;
}

export const LoadingOrb: React.FC<LoadingOrbProps> = ({
  message = 'Connecting the dots...',
  progress = 0,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-3xl animate-pulse-glow" />

        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-brand-purple/40"
        />

        {/* Secondary counter-rotating ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 rounded-full border border-brand-indigo/30"
        />

        {/* Central glowing orb */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-indigo via-brand-purple to-pink-500 shadow-[0_0_50px_rgba(139,92,246,0.6)] flex flex-col items-center justify-center p-1 relative overflow-hidden">
          {/* Inner reflection */}
          <div className="absolute top-2 left-8 right-8 h-8 bg-white/20 rounded-full blur-sm" />

          {/* Progress text */}
          <span className="text-2xl font-bold font-display text-white z-10">
            {progress > 0 ? `${Math.round(progress)}%` : 'AI'}
          </span>
        </div>
      </div>

      <div className="text-center max-w-sm">
        <h3 className="text-lg font-medium text-white/90 animate-pulse">
          {message}
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          Running entirely in your browser. Fully private.
        </p>
      </div>
    </div>
  );
};
export default LoadingOrb;
