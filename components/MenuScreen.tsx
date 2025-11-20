import React from 'react';
import { Button } from './Button';

interface MenuScreenProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onAction: () => void;
  variant?: 'cyan' | 'pink';
  isVisible: boolean;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ 
  title, 
  subtitle, 
  buttonText, 
  onAction, 
  variant = 'cyan',
  isVisible 
}) => {
  if (!isVisible) return null;

  const borderColor = variant === 'cyan' ? 'border-neon-cyan' : 'border-neon-pink';
  const shadowColor = variant === 'cyan' ? 'shadow-neon-cyan/40' : 'shadow-neon-pink/40';
  const titleColor = variant === 'cyan' ? 'text-neon-cyan' : 'text-neon-pink';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md p-8 bg-[#0a0a14]/95 border-2 ${borderColor} rounded-3xl text-center shadow-[0_0_40px_${shadowColor}] flex flex-col items-center gap-6 animate-fade-in`}>
        <h1 className={`text-4xl font-black tracking-wider uppercase drop-shadow-lg ${titleColor}`}>
          {title}
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          {subtitle}
        </p>
        <Button onClick={onAction} variant={variant}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};