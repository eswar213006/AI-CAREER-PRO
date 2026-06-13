import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div className={`glass-card ${glow ? 'glow-border' : ''} p-6 ${className}`}>
      {children}
    </div>
  );
};
