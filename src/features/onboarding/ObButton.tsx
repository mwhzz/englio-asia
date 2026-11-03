import type { ButtonHTMLAttributes } from 'react';

/** The large filled button at the bottom of each screen (iOS style). */
export function ObButton({ className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`ob-button ${className}`} {...rest}>
      {children}
    </button>
  );
}
