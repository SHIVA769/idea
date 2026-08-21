import React from 'react';

export const BrandLogo = ({ className = 'h-10 w-auto', alt = 'waply' }) => (
  <img src="/waply-logo.svg" alt={alt} className={`object-contain ${className}`} />
);
