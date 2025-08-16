
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-surface border border-brand-border rounded-lg shadow-lg p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;