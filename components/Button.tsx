import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'cyan' | 'pink';
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'cyan' }) => {
  const baseStyle = "w-full py-4 rounded-full border-2 font-black text-xl uppercase transition-all duration-200 touch-manipulation shadow-[0_0_15px_rgba(0,0,0,0.3)] active:scale-95 active:shadow-[0_0_30px]";
  
  const variantStyles = variant === 'cyan' 
    ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10 active:bg-neon-cyan active:text-black shadow-neon-cyan/20"
    : "border-neon-pink text-neon-pink bg-neon-pink/10 active:bg-neon-pink active:text-black shadow-neon-pink/20";

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyles}`}>
      {children}
    </button>
  );
};