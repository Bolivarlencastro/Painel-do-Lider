
import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 'md', ...props }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span
      className={`material-symbols-outlined select-none ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {name}
    </span>
  );
};
