import React from 'react';

export default function ResponsiveContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Standardized padding and vertical spacing used across list pages
  return (
    <div className={`space-y-4 sm:space-y-6 p-4 sm:p-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
