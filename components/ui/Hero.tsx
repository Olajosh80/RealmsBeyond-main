'use client';

import React from 'react';
import { Button } from './Button';

interface HeroProps {
  badge?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlay?: boolean;
  centered?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  badge,
  title,
  description,
  buttonText,
  buttonHref,
  secondaryButtonText,
  secondaryButtonHref,
  backgroundImage,
  backgroundVideo,
  overlay = true,
  centered = false,
}) => {
  return (
    <section className="relative overflow-hidden bg-rare-background">
      {/* Background Media */}
      {backgroundVideo ? (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </div>
      ) : backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover blur-sm transition-all duration-700 ease-in-out hover:blur-0"
            style={{
              objectPosition: 'center',
              filter: 'brightness(0.95)',
            }}
          />
        </div>
      ) : null}

      {/* Overlay */}
      {overlay && (backgroundImage || backgroundVideo) && (
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-rare-primary/40 via-rare-primary/30 to-rare-primary/50" />
      )}

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-20 md:py-32">
        <div className={`max-w-4xl ${centered ? 'mx-auto text-center' : ''}`}>
          {badge && (
            <div className="mb-6">
              <span className="inline-block text-xs font-body font-normal tracking-rare-nav uppercase text-rare-accent bg-rare-primary/80 px-4 py-2 rounded-full">
                {badge}
              </span>
            </div>
          )}

          <h1
            className={`font-heading text-4xl md:text-5xl lg:text-7xl font-normal leading-tight mb-6 ${
              backgroundImage || backgroundVideo
                ? 'text-white drop-shadow-lg'
                : 'text-rare-primary'
            }`}
          >
            {title}
          </h1>

          {description && (
            <p
              className={`font-body text-base md:text-lg leading-relaxed mb-8 max-w-2xl ${
                backgroundImage || backgroundVideo
                  ? 'text-white/90'
                  : 'text-rare-text-light'
              } ${centered ? 'mx-auto' : ''}`}
            >
              {description}
            </p>
          )}

          {(buttonText || secondaryButtonText) && (
            <div
              className={`flex flex-wrap gap-4 ${
                centered ? 'justify-center' : ''
              }`}
            >
              {buttonText && buttonHref && (
                <Button href={buttonHref} variant="primary" size="lg">
                  {buttonText}
                </Button>
              )}
              {secondaryButtonText && secondaryButtonHref && (
                <Button href={secondaryButtonHref} variant="outline" size="lg">
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
