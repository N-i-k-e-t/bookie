import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  delay = 0,
  hoverGlow = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        hoverGlow
          ? {
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.25)',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              y: -4,
            }
          : undefined
      }
      className={`glass rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Subtle top light reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </motion.div>
  );
};
export default GlassCard;
