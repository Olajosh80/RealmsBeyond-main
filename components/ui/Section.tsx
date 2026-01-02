import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'alt' | 'white' | 'gradient-beige' | 'gradient-blue' | 'gradient-soft';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  withTexture?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  background = 'default',
  padding = 'lg',
  id,
  withTexture = false,
}) => {
  const backgroundStyles = {
    default: 'bg-rare-background',
    alt: 'bg-rare-background-alt',
    white: 'bg-white',
    'gradient-beige': 'bg-gradient-beige',
    'gradient-blue': 'bg-gradient-blue text-white',
    'gradient-soft': 'bg-gradient-soft',
  };

  const paddingStyles = {
    none: '',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
  };

  const textureClass = withTexture ? 'texture-overlay' : '';

  return (
    <section
      id={id}
      className={`${backgroundStyles[background]} ${paddingStyles[padding]} ${textureClass} ${className} relative`}
    >
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

