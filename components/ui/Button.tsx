import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-body font-normal uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  
  const variantStyles = {
    primary: 'bg-rare-primary text-white hover:bg-rare-secondary',
    secondary: 'bg-rare-accent text-rare-text hover:bg-rare-accent/80',
    outline: 'border border-rare-border text-rare-primary hover:bg-rare-primary hover:text-white',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs tracking-rare-nav',
    md: 'px-6 py-3 text-xs tracking-rare-btn',
    lg: 'px-8 py-4 text-sm tracking-rare-btn',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  );
};

