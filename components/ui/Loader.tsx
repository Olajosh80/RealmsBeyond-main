import React from 'react';

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
    className = '',
    size = 'md',
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-10 w-10 border-3',
        lg: 'h-16 w-16 border-4',
    };

    const loader = (
        <div className={`animate-spin rounded-full border-rare-primary border-t-transparent ${sizeClasses[size]} ${className}`} />
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-rare-background">
                {loader}
            </div>
        );
    }

    return loader;
};
