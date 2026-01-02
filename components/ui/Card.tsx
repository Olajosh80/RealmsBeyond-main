import React from 'react';
import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  href?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  href,
}) => {
  const baseStyles = 'bg-white rounded-lg overflow-hidden shadow-md border border-rare-border/10';
  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]' : '';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const combinedClassName = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }
  
  return <div className={combinedClassName}>{children}</div>;
};

