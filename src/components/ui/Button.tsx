import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-medium tracking-wide transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer';

  const variants = {
    primary: 'bg-brand-purple hover:bg-brand-purple/90 text-white shadow-lg shadow-brand-purple/20',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
    gold: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
export default Button;
